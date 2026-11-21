import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { config } from './config.js';
// Strip markup delimiters and non-printable controls while retaining message line breaks.
const safeText = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform((s) =>
      s
        .replace(/[<>]/g, '')
        .replace(/\p{Cc}/gu, (char) => ('\n\r\t'.includes(char) ? char : ''))
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
  email: z.string().trim().email().max(254),
  company: safeText(160),
  message: safeText(5000, 5),
  website: z.string().max(200).optional().default(''),
});
export const enquirySchema = contactSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().max(80),
        quantity: z.number().int().min(1).max(9999),
        notes: safeText(1000, 0).default(''),
      }),
    )
    .min(1)
    .max(50),
});
type Submission = z.infer<typeof contactSchema> | z.infer<typeof enquirySchema>;
type RecordEntry = {
  id: string;
  createdAt: string;
  type: 'contact' | 'enquiry';
  payload: Submission;
  delivery: 'pending' | 'sent' | 'failed' | 'development';
};
let writeQueue: Promise<unknown> = Promise.resolve();
async function updateLog(entry: RecordEntry) {
  // Serialize read-modify-write and atomically replace the file to avoid lost simultaneous submissions.
  const operation = writeQueue.then(async () => {
    await mkdir(config.dataDir, { recursive: true });
    const file = path.join(config.dataDir, 'submissions.json');
    let entries: RecordEntry[] = [];
    try {
      entries = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index < 0) entries.push(entry);
    else entries[index] = entry;
    await writeFile(`${file}.tmp`, JSON.stringify(entries, null, 2), 'utf8');
    await rename(`${file}.tmp`, file);
  });
  writeQueue = operation.catch(() => {});
  await operation;
}
export async function submit(type: 'contact' | 'enquiry', payload: Submission, itemSummary = '') {
  const entry: RecordEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type,
    payload,
    delivery: 'pending',
  };
  await updateLog(entry);
  if (!process.env.SMTP_HOST) {
    if (config.production) {
      entry.delivery = 'failed';
      await updateLog(entry);
      throw new Error('Email service is not configured');
    }
    console.info(`[development] ${type} ${entry.id} saved; SMTP delivery skipped.`);
    entry.delivery = 'development';
    await updateLog(entry);
    return { id: entry.id, delivery: entry.delivery };
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'Wyztec <sales@wyztec.com>',
      to: process.env.SALES_EMAIL || 'sales@wyztec.com',
      replyTo: payload.email,
      subject: `Wyztec ${type === 'enquiry' ? 'product enquiry' : 'call-back request'} ${entry.id}`,
      text: `Reference: ${entry.id}\nName: ${payload.name}\nCompany: ${payload.company}\nPhone: ${payload.phone}\nEmail: ${payload.email}\n\n${payload.message}\n\n${itemSummary}`,
    });
    entry.delivery = 'sent';
    await updateLog(entry);
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'Wyztec <sales@wyztec.com>',
        to: payload.email,
        subject: `We received your Wyztec enquiry (${entry.id})`,
        text: `Hello ${payload.name},\n\nThank you for contacting Wyztec. Our team has received your request.\nReference: ${entry.id}\n\n${itemSummary}\n\nWyztec Solutions FZ-LLC\n+971 5512 64045\nsales@wyztec.com`,
      });
    } catch {
      console.error(`Acknowledgement delivery failed for ${entry.id}`);
    }
  } catch (error) {
    if (entry.delivery !== 'sent') {
      entry.delivery = 'failed';
      await updateLog(entry);
    }
    throw error;
  }
  return { id: entry.id, delivery: entry.delivery };
}
