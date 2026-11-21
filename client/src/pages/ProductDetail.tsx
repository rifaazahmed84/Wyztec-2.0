import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Plus, Download, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { api } from '../api';
import type { Product } from '../types';
import { company } from '../config';
import { useEnquiry } from '../context/Enquiry';
import ProductCard from '../components/ProductCard';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';
import NotFound from './NotFound';
import ProductImage, { TemporaryImageBadge } from '../components/ProductImage';
export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(false);
  const [retry, setRetry] = useState(0);
  const { add, setOpen } = useEnquiry();
  const carousel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setMissing(false);
    setProduct(null);
    setRelated([]);
    setImage(0);
    api<{ product: Product }>(`/api/products/${encodeURIComponent(slug || '')}`, {
      signal: controller.signal,
    })
      .then(async ({ product: p }) => {
        setProduct(p);
        setLoading(false);
        try {
          const { products } = await api<{ products: Product[] }>('/api/products', {
            signal: controller.signal,
          });
          setRelated(products.filter((r) => p.relatedSlugs?.includes(r.slug)));
        } catch {
          /* Related products do not block the product page. */
        }
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        if (e.message === 'Product not found') setMissing(true);
        else setError(e.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [slug, retry]);
  if (loading)
    return (
      <div className="container section" role="status">
        <div className="detail-skeleton skeleton" />
        Loading product details…
      </div>
    );
  if (missing) return <NotFound />;
  if (error || !product)
    return (
      <div className="empty-state container" role="alert">
        <h1>Product unavailable</h1>
        <p>{error}</p>
        <button className="button primary" onClick={() => setRetry(retry + 1)}>
          Try again
        </button>
      </div>
    );
  const p = product;
  const item = {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    image: p.images[0].src,
    quantity: 1,
    notes: '',
  };
  return (
    <>
      <SEO
        title={`${p.brand} ${p.name}`}
        description={p.tagline}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.overview,
          brand: { '@type': 'Brand', name: p.brand },
          sku: p.id,
          image: p.images.map((i) => company.url + i.src),
          category: p.category,
          url: `${company.url}/products/${p.slug}`,
        }}
      />
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/products">Products</Link>
          <ChevronRight size={13} />
          <Link to={`/products?category=${encodeURIComponent(p.category)}`}>{p.category}</Link>
          <ChevronRight size={13} />
          <span aria-current="page">{p.name}</span>
        </nav>
        <section className="product-detail-top">
          <div className="product-gallery">
            <div className="gallery-main">
              <ProductImage
                src={p.images[image].src}
                alt={p.images[image].alt}
                loading={image === 0 ? 'eager' : 'lazy'}
              />
              <TemporaryImageBadge lowRes={p.lowRes} />
            </div>
            <div className="gallery-thumbs">
              {p.images.map((img, index) => (
                <button
                  key={img.src}
                  onClick={() => setImage(index)}
                  aria-label={`Show ${p.name} image ${index + 1}`}
                  aria-pressed={image === index}
                >
                  <ProductImage src={img.src} alt="" />
                </button>
              ))}
              <span>Product images · actual model may differ</span>
            </div>
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">
              {p.brand} <span className="label-divider">/</span>{' '}
              {p.category.replace(p.brand, '').trim()}
            </span>
            <h1>{p.name}</h1>
            <p className="product-overview">{p.overview}</p>
            <div className="product-spec-preview">
              {p.specs.slice(0, 2).map((s) => (
                <div key={s.label}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
            <div className="hero-ctas">
              <a href="#request-quote" className="button primary">
                Request a Quote
              </a>
              <button className="button secondary" onClick={() => add(p)}>
                <Plus size={17} />
                Add to enquiry
              </button>
            </div>
            <button className="text-link small" onClick={() => setOpen(true)}>
              View your enquiry list
            </button>
            <p className="product-id">PRODUCT REFERENCE: {p.id}</p>
          </div>
        </section>
        <nav className="detail-nav" aria-label="Product information">
          <a href="#features">Key features</a>
          <a href="#specifications">Specifications</a>
          <a href="#applications">Applications</a>
          <a href="#request-quote">Request a quote</a>
        </nav>
        <div className="detail-content">
          <div>
            <section id="features" className="detail-section">
              <span className="eyebrow">Purposeful performance</span>
              <h2>Key features</h2>
              <ul className="feature-list">
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section id="specifications" className="detail-section">
              <h2>Technical specifications</h2>
              {!p.verified && (
                <div className="spec-notice">
                  <Info size={19} />
                  <p>
                    <strong>Typical selection ranges.</strong> These parameters are unverified and
                    vary by model. Confirm all ratings, options and approvals against the
                    manufacturer’s datasheet before ordering.
                  </p>
                </div>
              )}
              <table className="spec-table">
                <caption className="sr-only">
                  Typical selection parameters for {p.brand} {p.name}
                </caption>
                <tbody>
                  {p.specs.map((s) => (
                    <tr key={s.label}>
                      <th scope="row">{s.label}</th>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section id="applications" className="detail-section">
              <h2>Applications & industries</h2>
              <div className="industry-tags">
                {p.industries.map((ind) => (
                  <Link key={ind} to={`/products?industry=${encodeURIComponent(ind)}`}>
                    {ind}
                  </Link>
                ))}
              </div>
              <ul className="application-list">
                {p.applications.slice(0, 4).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>
            {!!p.documents?.length && (
              <section className="detail-section">
                <h2>Documents</h2>
                {p.documents.map((d) => (
                  <a className="button secondary" href={d.url} key={d.url} download>
                    <Download size={18} />
                    {d.label}
                  </a>
                ))}
              </section>
            )}
          </div>
          <aside className="selection-guide">
            <span className="eyebrow">Make an informed choice</span>
            <h2>Is this the right fit?</h2>
            <p>{p.selectionGuide}</p>
            <a href="#request-quote" className="text-link">
              Discuss your application
            </a>
            <hr />
            <span>Need a replacement?</span>
            <p>
              Share a clear photo of the nameplate and your installation dimensions with our team.
            </p>
            <a className="text-link" href="mailto:sales@wyztec.com">
              sales@wyztec.com
            </a>
          </aside>
        </div>
        <section id="request-quote" className="product-quote section">
          <div>
            <span className="eyebrow">Let’s get specific</span>
            <h2>
              Request a quote for
              <br />
              {p.name}.
            </h2>
            <p>
              Tell us your operating conditions, preferred model and quantity. Our team will prepare
              a suitable offer.
            </p>
          </div>
          <ContactForm key={p.id} items={[item]} productName={`${p.brand} ${p.name}`} />
        </section>
        {related.length > 0 && (
          <section className="section related-section">
            <div className="section-heading-row">
              <h2>Related products</h2>
              <div className="related-controls">
                <button
                  className="icon-button"
                  aria-label="Previous related products"
                  onClick={() =>
                    carousel.current?.scrollBy({
                      left: -350,
                      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                        ? 'auto'
                        : 'smooth',
                    })
                  }
                >
                  <ChevronLeft />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next related products"
                  onClick={() =>
                    carousel.current?.scrollBy({
                      left: 350,
                      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                        ? 'auto'
                        : 'smooth',
                    })
                  }
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            <div className="related-carousel" ref={carousel}>
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
