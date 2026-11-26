import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  Handshake,
  ShieldCheck,
  Layers3,
  Truck,
  Check,
} from 'lucide-react';
import { useInView, useReducedMotion } from 'framer-motion';
import { industries, segments } from '../data/taxonomy';
import { useEnquiry } from '../context/Enquiry';
import ContactForm from './ContactForm';
import { api } from '../api';
export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-title">
      <span className="eyebrow">
        <span className="green-line" />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function AboutSection({ full = false }: { full?: boolean }) {
  return (
    <section className="section about-section" id="about">
      <div className="container">
        <div className="about-top">
          <SectionTitle
            eyebrow="The company"
            title="One partner. A world of industrial possibilities."
          />
          <div className="about-copy">
            <p className="lead">
              Wyztec is a multi-brand distributor of products for the industry based in the United
              Arab Emirates.
            </p>
            <p>
              Our focus is the oil & gas sector and adjacent markets, supported by a sales team with
              years of industry experience. We bring together diverse product categories and an
              extensive range of brands to cover equipment, components and devices across the
              manufacturing sector.
            </p>
            <p>
              Our objective is to be your single reference point for industrial needs. We build
              personal relationships with reliable, trustworthy partners—because trust matters to
              us, within and beyond business.
            </p>
            {!full && (
              <Link className="text-link" to="/about">
                Get to know Wyztec
              </Link>
            )}
          </div>
        </div>
        <div className="values-grid">
          {[
            {
              icon: Target,
              title: 'Our mission',
              text: 'Source and provide the best quality product at the lowest economic proposition and maximum value additions through strong ethics combined with efficient logistics and excellent management services.',
            },
            {
              icon: Eye,
              title: 'Our vision',
              text: 'To build the finest organization that delivers value of great significance to our customers, partners, society and nation.',
            },
            { icon: Handshake, title: 'Our values', text: '' },
          ].map(({ icon: Icon, title, text }) => (
            <article className="value-card" key={title}>
              <Icon size={27} strokeWidth={1.4} />
              <h3>{title}</h3>
              {text ? (
                <p>{text}</p>
              ) : (
                <ul className="values-list">
                  {[
                    'Entrepreneurship',
                    'Flexibility',
                    'Transparency',
                    'Deliver The Promise',
                    'Empowerment',
                    'Learning',
                  ].map((v) => (
                    <li key={v}>
                      <Check size={14} />
                      {v}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Counter({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(value);
  useEffect(() => {
    if (!seen || reduced) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      setCount(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [seen, reduced, value]);
  return (
    <div ref={ref} className="stat">
      <strong>
        <span className="sr-only">
          {value}
          {suffix}
        </span>
        <span aria-hidden="true">
          {count}
          {suffix}
        </span>
      </strong>
      <span>{label}</span>
    </div>
  );
}
export function WhySection() {
  return (
    <section className="section why-section">
      <div className="container">
        <div className="why-top">
          <SectionTitle
            eyebrow="The Wyztec difference"
            title="Built on quality. Backed by people."
            description="Why choose Wyztec? Because the right component is only part of the solution."
          />
          <div>
            <p>
              Our industrial products are meticulously engineered to meet the highest standards,
              ensuring reliability and durability in every application. Quality is our cornerstone.
            </p>
            <p>
              With cutting-edge technology and innovative solutions, our commitment to staying ahead
              of industry trends helps your business enhance efficiency and performance.
            </p>
          </div>
        </div>
        <div className="stats">
          <Counter value={100} suffix="+" label="Brands" />
          <Counter value={500} suffix="+" label="Happy Customers" />
          <Counter value={75} label="Team Members" />
          <Counter value={4} label="Offices" />
        </div>
      </div>
    </section>
  );
}
export function IndustrySection() {
  const [active, setActive] = useState(0);
  const selected = industries[active];
  const Icon = selected.icon;
  return (
    <section className="section industry-section" id="industries">
      <div className="container">
        <div className="section-heading-row">
          <SectionTitle
            eyebrow="Industries we serve"
            title="Industry knowledge. Practical solutions."
            description="Leading the Way in Industrial Excellence"
          />
          <Link className="text-link" to="/industries">
            Explore our industries
          </Link>
        </div>
        <div className="industry-layout">
          <div
            className="industry-tabs"
            role="tablist"
            aria-label="Industries"
            aria-orientation="vertical"
          >
            {industries.map((industry, index) => (
              <button
                key={industry.name}
                id={`industry-tab-${index}`}
                role="tab"
                aria-selected={active === index}
                aria-controls="industry-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(e) => {
                  let next = index;
                  if (e.key === 'ArrowDown') next = (index + 1) % industries.length;
                  else if (e.key === 'ArrowUp')
                    next = (index + industries.length - 1) % industries.length;
                  else if (e.key === 'Home') next = 0;
                  else if (e.key === 'End') next = industries.length - 1;
                  else return;
                  e.preventDefault();
                  setActive(next);
                  document.getElementById(`industry-tab-${next}`)?.focus();
                }}
              >
                <industry.icon size={21} strokeWidth={1.5} />
                {industry.name}
                <span className="tab-indicator" />
              </button>
            ))}
          </div>
          <div
            className="industry-panel"
            id="industry-panel"
            role="tabpanel"
            aria-labelledby={`industry-tab-${active}`}
            tabIndex={0}
          >
            <div className="industry-icon">
              <Icon size={90} strokeWidth={1} />
            </div>
            <span className="eyebrow">Application-focused supply</span>
            <h3>{selected.name}</h3>
            <p className="lead">{selected.description}</p>
            <p>{selected.detail}</p>
            <Link
              className="button primary"
              to={`/products?industry=${encodeURIComponent(selected.name)}`}
            >
              View products for this industry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function SegmentsSection() {
  const { setOpen } = useEnquiry();
  return (
    <section className="section segments-section" id="market-segments">
      <div className="container">
        <SectionTitle
          eyebrow="Our market segments"
          title="The right components. Connected."
          description="Tailored Solutions for Diverse Industries"
        />
        <div className="segments-grid">
          {segments.map(({ name, icon: Icon, description, query }) => (
            <article className="segment-card" key={name}>
              <Icon size={28} strokeWidth={1.4} />
              <h3>{name}</h3>
              <p>{description}</p>
              {query ? (
                <Link className="text-link" to={`/products?q=${encodeURIComponent(query)}`}>
                  Explore products
                </Link>
              ) : (
                <button className="text-link" onClick={() => setOpen(true)}>
                  Discuss your requirements
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
// Display labels only; the catalog determines which brand cards are shown.
const featuredBrands = [
  'Altra', 'Delta', 'Grundfos', 'JUMO', 'Klinger',
  'Lovejoy', 'Marathon', 'Metal Work', 'Premium Transmission', 'Siemens',
];
const brandKey = (name: string) => name.toLowerCase().replace(/\s/g, '');
const brandLabel = (name: string) =>
  featuredBrands.find((brand) => brandKey(brand) === brandKey(name)) ?? name;
const brandLogos: Record<string, { file: string; label: string; dark?: boolean; caption?: string }> = {
  altra: { file: 'premium-transmission.webp', label: 'Premium Transmission', caption: 'Altra range' },
  jumo: { file: 'jumo.svg', label: 'JUMO' },
  marathon: { file: 'marathon.png', label: 'Marathon Electric', dark: true },
  metalwork: { file: 'metal-work.svg', label: 'Metal Work Pneumatic' },
  premiumtransmission: { file: 'premium-transmission.webp', label: 'Premium Transmission' },
  siemens: { file: 'siemens.webp', label: 'Siemens' },
};
export function BrandsSection() {
  const [catalogBrands, setCatalogBrands] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    api<{ brands: string[] }>('/api/brands', { signal: controller.signal })
      .then(({ brands }) => setCatalogBrands(brands))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const brands = [...new Map(
    catalogBrands.map((name) => [brandKey(name), name]),
  ).values()].sort((a, b) => a.localeCompare(b));
  return (
    <section className="section supply-brands" id="brands" aria-labelledby="supply-brands-title">
      <div className="container">
        <div className="supply-brands-heading">
          <div>
            <span className="eyebrow">GLOBAL BRANDS. LOCAL EXPERTISE.</span>
            <h2 id="supply-brands-title">Brands We Supply</h2>
            <p>Authorized dealers for leading industrial brands. Your single point of contact for sourcing and support.</p>
          </div>
          <Link to="/products" className="button primary">Explore our products</Link>
        </div>
        <ul className="supply-brands-grid">
          {brands.map((brand) => {
            const logo = brandLogos[brandKey(brand)];
            return (
            <li key={brandKey(brand)}>
              <Link
                to={`/products?${new URLSearchParams({ brand })}`}
                aria-label={`Browse ${brandLabel(brand)} products`}
              >
                {logo ? (
                  <span className={`brand-logo-frame${logo.dark ? ' brand-logo-dark' : ''}`}>
                    <img
                      src={`/images/brands/${logo.file}`}
                      alt={logo.label}
                      width={220}
                      height={110}
                      loading="lazy"
                    />
                  </span>
                ) : <span>{brandLabel(brand)}</span>}
                {logo?.caption && <span className="brand-range-label">{logo.caption}</span>}
                <small>Browse products</small>
              </Link>
            </li>
            );
          })}
        </ul>
        <p className="supply-brands-note">Motors &amp; drives &middot; Pneumatics &middot; Power transmission &middot; Process instrumentation</p>
      </div>
    </section>
  );
}
export function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-layout">
        <div>
          <SectionTitle
            eyebrow="Let’s talk requirements"
            title="A good solution starts with a conversation."
          />
          <p>Get Answers to All Your Questions Might Have</p>
          <p>
            Tell us what you need. We will answer your questions about our products and help you
            find the right fit.
          </p>
          <a className="contact-number" href="tel:+971551264045">
            +971 5512 64045
          </a>
          <span className="muted">We are online 24/7</span>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
export function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="container">
        {[
          {
            icon: ShieldCheck,
            title: 'Quality-led sourcing',
            text: 'Products selected for your application',
          },
          {
            icon: Layers3,
            title: 'Multi-brand expertise',
            text: 'A broad range. One point of contact.',
          },
          { icon: Truck, title: 'Efficient logistics', text: 'From requirements to delivery' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon size={25} strokeWidth={1.3} />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
