// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';
import { readBasket } from '../context/Enquiry';
import Overlay from './Overlay';
// Node 25 exposes an experimental localStorage global; use deterministic browser storage in tests.
beforeEach(() => {
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
  it('submits a product enquiry and distinguishes development receipts', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'receipt-123', delivery: 'development' }),
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
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await screen.findByText('Request saved locally');
    expect(success).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe('/api/enquiries');
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.items[0].quantity).toBe(2);
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
