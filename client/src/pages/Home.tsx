import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import {
  AboutSection,
  WhySection,
  IndustrySection,
  SegmentsSection,
  BrandsSection,
  ContactSection,
  TrustStrip,
  SectionTitle,
} from '../components/Sections';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import { company } from '../config';
import type { Product } from '../types';
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>();
  useEffect(() => {
    const controller = new AbortController();
    api<{ products: Product[] }>('/api/products', { signal: controller.signal })
      .then(({ products: p }) => {
        setTotal(p.length);
        setProducts(p.length >= 14 ? [p[2], p[8], p[13]] : p.slice(0, 3));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <>
      <SEO
        title="Your Partner in Reliable Industrial Solutions"
        description="Wyztec connects UAE industries with global brands in motors, gearboxes, pneumatics and instrumentation. Explore our catalog and request a quote."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: company.name,
          url: company.url,
          telephone: company.tel,
          email: company.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'P.O. Box 16111, Al Hamra Industrial Zone-FZ',
            addressLocality: 'Ras Al Khaimah',
            addressCountry: 'AE',
          },
        }}
      />
      <Hero />
      <TrustStrip />
      <BrandsSection />
      <section className="section home-products">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="Engineered for your everyday"
              title="Big requirements. Right components."
              description="Explore our range of industrial essentials from trusted global brands."
            />
            <Link to="/products" className="button secondary">
              View all products{' '}
              {total !== undefined && <span className="small-count">{total}</span>}
            </Link>
          </div>
          <div className="product-grid">
            {products.length ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="catalog-intro">
                <p>Motors, industrial fans, gearboxes, pneumatics and instrumentation.</p>
                <Link className="text-link" to="/products">
                  Explore the full product catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <AboutSection />
      <WhySection />
      <IndustrySection />
      <SegmentsSection />
      <ContactSection />
    </>
  );
}
