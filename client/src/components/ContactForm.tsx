import { useId, useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { api, ApiError } from '../api';
import type { EnquiryItem } from '../types';
import { track } from '../analytics';
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
  const [receipt, setReceipt] = useState<{ id?: string; delivery?: string } | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setFailure('');
    const next: Record<string, string> = {};
    for (const key of ['name', 'phone', 'email', 'company', 'message'] as const)
      if (!values[key].trim()) next[key] = 'This field is required.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = 'Enter a valid email address.';
    if (values.phone && !/^[+\d\s().-]{7,30}$/.test(values.phone))
      next.phone = 'Enter a valid phone number.';
    if (values.message.trim().length < 5) next.message = 'Please include at least 5 characters.';
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ id?: string; delivery?: string }>(
        items ? '/api/enquiries' : '/api/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            ...(items
              ? {
                  items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    notes: i.notes,
                  })),
                }
              : {}),
          }),
        },
      );
      setReceipt(result);
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
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={36} />
        <h3>
          {receipt.delivery === 'development'
            ? 'Request saved locally'
            : 'Thank you. Your request is received.'}
        </h3>
        <p>
          {receipt.delivery === 'development'
            ? 'Development mode: this request is stored on the server. Email delivery requires SMTP configuration.'
            : 'Our team will review your requirements and get in touch.'}
        </p>
        {receipt.id && <p className="reference">Reference: {receipt.id}</p>}
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
          How can we help? <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          maxLength={5000}
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
          ) : items ? (
            'Send enquiry'
          ) : productName ? (
            'Request a quote'
          ) : (
            'Call Back'
          )}
        </button>
        <small>We use your details only to respond to this enquiry.</small>
      </div>
    </form>
  );
}
