import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { api, ApiError } from '../api';
import type { EnquiryItem } from '../types';
import { track } from '../analytics';
import { submissionKey } from '../submissionKey';
type Fields = {
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
  website: string;
};
export default function ContactForm({
  items,
  onSuccess,
  onReset,
  productName,
  compact = false,
}: {
  items?: EnquiryItem[];
  onSuccess?: () => void;
  onReset?: () => void;
  productName?: string;
  compact?: boolean;
}) {
  const id = useId();
  const [values, setValues] = useState<Fields>({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: productName ? `Please send a quotation for ${productName}.` : '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [receipt, setReceipt] = useState<{ reference: string } | null>(null);
  const [quantity, setQuantity] = useState(String(items?.[0]?.quantity ?? 1));
  const submitting = useRef(false);
  const attempt = useRef<{ body: string; key: string; storageKey: string }>();
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!receipt) return;
    confirmation.current?.focus({ preventScroll: true });
    confirmation.current?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
  }, [receipt]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setFailure('');
    const next: Record<string, string> = {};
    for (const key of ['name', 'phone', 'email', 'company', 'message'] as const)
      if (!values[key].trim()) next[key] = 'This field is required.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = 'Enter a valid email address.';
    if (values.phone && !/^[+\d\s().-]{7,30}$/.test(values.phone))
      next.phone = 'Enter a valid phone number.';
    if (values.message.trim().length < 5) next.message = 'Please include at least 5 characters.';
    if (productName && (!/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > 9999))
      next.quantity = 'Enter a whole number from 1 to 9999.';
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const body = JSON.stringify({
        ...values,
        ...(items
          ? {
              items: items.map((i) => ({
                productId: i.productId,
                quantity: productName ? Number(quantity) : i.quantity,
                notes: i.notes,
              })),
            }
          : {}),
      });
      if (attempt.current?.body !== body)
        attempt.current = { body, ...(await submissionKey(body)) };
      const result = await api<{ reference: string }>(items ? '/api/enquiries' : '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.current.key },
        body,
      });
      if (!/^WYZ-[A-F0-9]{32}$/.test(result.reference ?? ''))
        throw new Error(
          'We could not confirm your request. Please retry; your details are still here.',
        );
      setReceipt(result);
      try {
        sessionStorage.removeItem(attempt.current.storageKey);
      } catch {
        /* Storage may be blocked. */
      }
      attempt.current = undefined;
      track('enquiry_submit', { type: items ? 'products' : 'callback' });
      onSuccess?.();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Please try again.');
      if (error instanceof ApiError)
        setErrors(
          Object.fromEntries(
            Object.entries(error.fields).map(([key, messages]) => [key, messages[0]]),
          ),
        );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="form-success" role="status" ref={confirmation} tabIndex={-1}>
        <CheckCircle2 size={36} />
        <h3>Thank you. Your request is received.</h3>
        <p>
          Our team will review your requirements and get in touch. Keep this reference for your
          records.
        </p>
        <p className="reference">Reference: {receipt.reference}</p>
        <button
          className="button secondary"
          onClick={() => {
            setReceipt(null);
            setValues((v) => ({ ...v, message: '' }));
            onReset?.();
          }}
        >
          Send another request
        </button>
      </div>
    );
  return (
    <form className={`contact-form ${compact ? 'compact' : ''}`} onSubmit={submit} noValidate>
      {productName && (
        <div className="form-grid">
          <div className="field">
            <label htmlFor={`${id}-product`}>Selected product</label>
            <input id={`${id}-product`} value={productName} readOnly />
          </div>
          <div className="field">
            <label htmlFor={`${id}-quantity`}>
              Quantity <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${id}-quantity`}
              name="quantity"
              type="number"
              min={1}
              max={9999}
              step={1}
              required
              disabled={busy}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? `${id}-quantity-error` : undefined}
            />
            {errors.quantity && (
              <span className="field-error" id={`${id}-quantity-error`}>
                {errors.quantity}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="form-grid">
        {(
          [
            ['name', 'Full name', 'Alex Morgan', 'text', 100],
            ['phone', 'Phone number', '+971', 'tel', 30],
            ['email', 'Email address', 'you@company.com', 'email', 254],
            ['company', 'Company name', 'Your company', 'text', 160],
          ] as const
        ).map(([key, label, placeholder, type, max]) => (
          <div className="field" key={key}>
            <label htmlFor={`${id}-${key}`}>
              {label} <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${id}-${key}`}
              name={key}
              autoComplete={
                key === 'name'
                  ? 'name'
                  : key === 'phone'
                    ? 'tel'
                    : key === 'email'
                      ? 'email'
                      : 'organization'
              }
              type={type}
              disabled={busy}
              maxLength={max}
              placeholder={placeholder}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              required
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}
            />
            {errors[key] && (
              <span className="field-error" id={`${id}-${key}-error`}>
                {errors[key]}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="field">
        <label htmlFor={`${id}-message`}>
          {items ? 'Your requirements' : 'How can we help?'} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          maxLength={5000}
          disabled={busy}
          placeholder="Tell us about your product, application or project requirements…"
          value={values.message}
          onChange={(e) => setValues({ ...values, message: e.target.value })}
          required
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
        />
        {errors.message && (
          <span className="field-error" id={`${id}-message-error`}>
            {errors.message}
          </span>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setValues({ ...values, website: e.target.value })}
        />
      </div>
      {failure && (
        <p className="field-error" role="alert">
          {failure}
        </p>
      )}
      <div className="form-bottom">
        <button className="button primary" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle className="spin" size={18} /> Sending…
            </>
          ) : failure ? (
            'Retry request'
          ) : productName ? (
            'Request a quote'
          ) : items ? (
            'Send enquiry'
          ) : (
            'Call Back'
          )}
        </button>
        <small>We use your details only to respond to this enquiry.</small>
      </div>
    </form>
  );
}
