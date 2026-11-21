// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ProductImage, { PRODUCT_PLACEHOLDER } from './ProductImage';
afterEach(cleanup);
describe('Product image fallback', () => {
  it('reserves dimensions, falls back once, and retries a newly selected source', () => {
    const { rerender } = render(<ProductImage src="/missing.webp" alt="Marathon IE4 Motor" />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.getAttribute('width')).toBe('1200');
    expect(img.getAttribute('height')).toBe('1200');
    expect(img.getAttribute('loading')).toBe('lazy');
    fireEvent.error(img);
    expect(img.getAttribute('src')).toBe(PRODUCT_PLACEHOLDER);
    fireEvent.error(img);
    expect(img.getAttribute('src')).toBe(PRODUCT_PLACEHOLDER);
    rerender(<ProductImage src="/replacement.webp" alt="Marathon IE4 Motor" loading="eager" />);
    expect(img.getAttribute('src')).toBe('/replacement.webp');
    expect(img.getAttribute('loading')).toBe('eager');
  });
});
