import { createHash, createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import type { Request } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { database } from './database.js';
import { productIdAliases } from './data/products.js';

const safeText = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform((s) =>
      s
        .replace(/[<>]/g, '')
        .replace(/\p{Cc}/gu, (c) => ('\n\r\t'.includes(c) ? c : ''))
        .trim(),
    )
    .pipe(z.string().min(min));
export const contactSchema = z.object({
  name: safeText(100),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[+\d\s().-]+$/, 'Enter a valid phone number'),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  company: safeText(160),
  message: safeText(5000, 5),
  website: z.string().max(200).optional().default(''),
});
export const enquirySchema = contactSchema.extend({
  items: z
    .array(
      z.object({
        productId: z
          .string()
          .min(1)
          .max(80)
          .transform((id) => productIdAliases[id] ?? id),
        quantity: z.number().int().min(1).max(9999),
        notes: safeText(1000, 0).default(''),
      }),
    )
    .min(1)
    .max(50)
    .refine(
      (items) => new Set(items.map((i) => i.productId)).size === items.length,
      'Include each product only once; update its quantity instead.',
    ),
});
export const idempotencySchema = z.uuid();
export class SubmissionError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export function clientRateKey(req: Request) {
  const secret = process.env.QUOTE_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('Quote rate limit secret is missing or too short');
  // Vercel overwrites X-Forwarded-For. Other hosts use the socket, not visitor-supplied headers.
  let ip =
    (process.env.VERCEL === '1' ? req.get('x-forwarded-for')?.split(',')[0].trim() : undefined) ||
    req.socket.remoteAddress ||
    'unknown';
  ip = ip.replace(/^::ffff:(?=\d+\.)/i, '');
  if (isIP(ip) === 6) {
    const [left, right = ''] = ip.split('::');
    const start = left ? left.split(':') : [];
    const end = right ? right.split(':') : [];
    // Group IPv6 privacy addresses by /64.
    ip =
      [...start, ...Array(Math.max(0, 8 - start.length - end.length)).fill('0'), ...end]
        .slice(0, 4)
        .map((part) => Number.parseInt(part, 16).toString(16))
        .join(':') + '::/64';
  } else if (!isIP(ip)) ip = 'unknown';
  return createHmac('sha256', secret).update(ip).digest('hex');
}

type Submission = z.infer<typeof contactSchema> | z.infer<typeof enquirySchema>;
export async function submit(
  type: 'contact' | 'enquiry',
  payload: Submission,
  key: string,
  clientKey: string,
) {
  const customer = {
    name: payload.name,
    email: payload.email,
    company: payload.company,
    phone: payload.phone,
    message: payload.message,
  };
  const items = ('items' in payload ? payload.items : [])
    .slice()
    .sort((a, b) => a.productId.localeCompare(b.productId));
  const hash = createHash('sha256').update(JSON.stringify({ type, customer, items })).digest('hex');
  const saved = await database.saveQuote({
    p_key: key,
    p_hash: hash,
    p_client_key: clientKey,
    p_kind: type,
    p_customer: customer,
    p_items: items,
  });
  if ('error' in saved) {
    if (saved.error === 'INVALID_PRODUCT')
      throw new SubmissionError(
        saved.error,
        400,
        'One or more products are unavailable. Please update your enquiry.',
      );
    if (saved.error === 'RATE_LIMIT')
      throw new SubmissionError(
        saved.error,
        429,
        'Too many requests. Please wait a minute and retry.',
        saved.retryAfter ?? 60,
      );
    throw new SubmissionError(
      saved.error,
      409,
      'This submission reference was already used for different details. Please start a new request.',
    );
  }
  // A retry returns the original receipt and never resends mail. Save success is independent of SMTP.
  if (saved.created) {
    let status: 'sent' | 'failed' | 'not_configured' = 'not_configured';
    if (process.env.SMTP_HOST) {
      status = 'failed';
      try {
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        });
        await transport.sendMail({
          from: process.env.SMTP_FROM || 'Wyztec <sales@wyztec.com>',
          to: process.env.SALES_EMAIL || 'sales@wyztec.com',
          replyTo: customer.email,
          subject: `Wyztec ${type === 'enquiry' ? 'quote request' : 'call-back request'} ${saved.reference}`,
          text: `Reference: ${saved.reference}\nName: ${customer.name}\nCompany: ${customer.company}\nPhone: ${customer.phone}\nEmail: ${customer.email}\n\n${customer.message}\n\n${items.map((i) => `${i.productId} x ${i.quantity}\n${i.notes}`).join('\n\n')}\n\nReview this request and product snapshots in the Supabase Dashboard.`,
        });
        status = 'sent';
      } catch {
        console.error(`Sales notification failed for ${saved.reference}; request remains saved.`);
      }
    }
    try {
      await database.setNotification(saved.id, status);
    } catch {
      console.error(
        `Notification status not updated for ${saved.reference}; review pending notifications.`,
      );
    }
  }
  return { reference: saved.reference, created: saved.created };
}
