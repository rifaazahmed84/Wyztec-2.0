import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { useEnquiry } from '../context/Enquiry';
import ProductImage, { TemporaryImageBadge } from './ProductImage';
export default function ProductCard({ product: p }: { product: Product }) {
  const { add, items } = useEnquiry();
  const added = items.some((i) => i.productId === p.id);
  return (
    <article className="product-card">
      <Link className="product-image" to={`/products/${p.slug}`} tabIndex={-1} aria-hidden="true">
        <ProductImage src={p.images[0].src} alt={p.images[0].alt} />
        <span className="image-label">{p.category.replace(p.brand, '').trim()}</span>
        <TemporaryImageBadge lowRes={p.lowRes} />
      </Link>
      <div className="product-card-content">
        <span className="eyebrow">{p.brand}</span>
        <h3>
          <Link to={`/products/${p.slug}`}>{p.name}</Link>
        </h3>
        <p>{p.tagline}</p>
        <div className="spec-badges">
          {p.specs.slice(0, 2).map((s) => (
            <span key={s.label} title={`${s.label}: ${s.value}`}>
              {s.value.split(';')[0]}
            </span>
          ))}
        </div>
        <div className="product-card-bottom">
          <Link className="text-link" to={`/products/${p.slug}`}>
            View details
          </Link>
          <button
            className={`add-button ${added ? 'added' : ''}`}
            onClick={() => add(p)}
            aria-label={`${added ? 'Add another' : 'Add to enquiry'}: ${p.brand} ${p.name}`}
          >
            <span>{added ? 'Add another' : 'Add to enquiry'}</span>
            {added ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}
