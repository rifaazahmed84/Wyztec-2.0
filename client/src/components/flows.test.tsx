// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';
import { readBasket } from '../context/Enquiry';
import Overlay from './Overlay';
import { webcrypto } from 'node:crypto';
import { TextEncoder } from 'node:util';
// Node 25 exposes an experimental localStorage global; use deterministic browser storage in tests.
beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('TextEncoder', TextEncoder);
  sessionStorage.clear();
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, String(value)),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('Customer enquiry flow', () => {
  it('validates locally and does not send incomplete requests', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Call Back' }));
    expect(screen.getAllByText('This field is required.').length).toBeGreaterThan(0);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Full name/)).toBe(document.activeElement);
  });
  it('submits the selected product and editable quantity, showing only a confirmed database reference', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reference: 'WYZ-' + 'A'.repeat(32) }),
    });
    vi.stubGlobal('fetch', fetch);
    const success = vi.fn();
    render(
      <ContactForm
        productName="IE4 Motor"
        items={[
          {
            productId: 'WYZ-003',
            slug: 'marathon-ie4-motor',
            name: 'IE4 Motor',
            brand: 'Marathon',
            image: '/motor.svg',
            quantity: 2,
            notes: '400 V',
          },
        ]}
        onSuccess={success}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'Customer' } });
    fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: '+971551264045' } });
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Company name/), { target: { value: 'Industry' } });
    expect((screen.getByLabelText('Selected product') as HTMLInputElement).value).toBe('IE4 Motor');
    fireEvent.change(screen.getByLabelText(/Quantity/), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Request a quote' }));
    await screen.findByText('Thank you. Your request is received.');
    expect(screen.getByText('Reference: WYZ-' + 'A'.repeat(32))).toBeTruthy();
    expect(success).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe('/api/enquiries');
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.items[0].quantity).toBe(7);
    expect(body.items[0].productId).toBe('WYZ-003');
    expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.message).toContain('IE4 Motor');
  });
  it('shows a recoverable server error and retains entered values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Please try again later.' } }),
      }),
    );
    render(<ContactForm />);
    for (const [label, value] of [
      [/Full name/, 'Customer'],
      [/Phone number/, '123456789'],
      [/Email address/, 'a@example.com'],
      [/Company name/, 'Company'],
      [/How can we help/, 'Please quote this motor.'],
    ] as const)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Call Back' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('Please try again later.');
    expect((screen.getByLabelText(/Full name/) as HTMLInputElement).value).toBe('Customer');
  });
  it('recovers safely from corrupt or invalid localStorage', () => {
    localStorage.setItem('wyztec-enquiry-v1', 'invalid');
    expect(readBasket()).toEqual([]);
    localStorage.setItem('wyztec-enquiry-v1', JSON.stringify([{ productId: '1', quantity: -1 }]));
    expect(readBasket()).toEqual([]);
  });
  it('prevents double clicks, preserves input and reuses the key after a lost response', async () => {
    const success = vi.fn();
    let rejectFirst: (error: Error) => void = () => {};
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockResolvedValue({ ok: true, json: async () => ({ reference: 'WYZ-' + 'B'.repeat(32) }) });
    vi.stubGlobal('fetch', fetch);
    render(<ContactForm onSuccess={success} />);
    for (const [label, value] of [
      [/Full name/, 'Customer'],
      [/Phone number/, '123456789'],
      [/Email address/, 'a@example.com'],
      [/Company name/, 'Company'],
      [/How can we help/, 'Please quote this motor.'],
    ] as const)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    const button = screen.getByRole('button', { name: 'Call Back' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(success).not.toHaveBeenCalled();
    rejectFirst(new Error('Network connection lost.'));
    await screen.findByRole('alert');
    expect((screen.getByLabelText(/Company name/) as HTMLInputElement).value).toBe('Company');
    fireEvent.click(screen.getByRole('button', { name: 'Retry request' }));
    await screen.findByText('Thank you. Your request is received.');
    expect(fetch.mock.calls[1][1].headers['Idempotency-Key']).toBe(
      fetch.mock.calls[0][1].headers['Idempotency-Key'],
    );
    expect(fetch.mock.calls[1][1].body).toBe(fetch.mock.calls[0][1].body);
    expect(success).toHaveBeenCalledOnce();
  });
  it('does not clear the form or claim success if the server response has no saved reference', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
    const success = vi.fn();
    render(<ContactForm onSuccess={success} />);
    for (const [label, value] of [
      [/Full name/, 'Customer'],
      [/Phone number/, '123456789'],
      [/Email address/, 'a@example.com'],
      [/Company name/, 'Company'],
      [/How can we help/, 'Please quote this motor.'],
    ] as const)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Call Back' }));
    await screen.findByRole('alert');
    expect(success).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/Full name/) as HTMLInputElement).value).toBe('Customer');
  });
  it('closes the drawer with Escape and restores focus', async () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();
    const close = vi.fn();
    const { unmount } = render(
      <Overlay title="Enquiry" onClose={close}>
        <input aria-label="Name" />
      </Overlay>,
    );
    await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('dialog'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(document.activeElement).toBe(button);
    button.remove();
  });
});
