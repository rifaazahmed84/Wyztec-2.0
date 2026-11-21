import { useState, type ImgHTMLAttributes } from 'react';

export const PRODUCT_PLACEHOLDER = '/images/products/_placeholder.webp';

/** Keep the same square geometry when the source or its fallback loads. */
export default function ProductImage({
  src,
  alt,
  loading = 'lazy',
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height' | 'onError'>) {
  const [failedSource, setFailedSource] = useState<string>();
  const failed = failedSource === src;
  return (
    <img
      {...props}
      src={failed ? PRODUCT_PLACEHOLDER : src}
      alt={alt}
      width={1200}
      height={1200}
      loading={loading}
      onError={() => {
        // A failed placeholder must not cause an endless load/error loop.
        if (!failed && src !== PRODUCT_PLACEHOLDER) setFailedSource(src);
      }}
    />
  );
}

export function TemporaryImageBadge({ lowRes }: { lowRes?: boolean }) {
  return import.meta.env.DEV && lowRes ? (
    <span className="temporary-image-badge">Temporary image</span>
  ) : null;
}
