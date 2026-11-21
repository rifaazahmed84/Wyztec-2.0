import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import { api } from '../api';
import type { Product } from '../types';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { industries } from '../data/taxonomy';
import { useEnquiry } from '../context/Enquiry';
const keys = ['q', 'brand', 'category', 'industry', 'sort'];
export default function Products() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(9);
  const [filters, setFilters] = useState(false);
  const [retry, setRetry] = useState(0);
  const { setOpen } = useEnquiry();
  const key = params.toString();
  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api<{ categories: string[] }>('/api/categories', { signal: controller.signal }),
      api<{ brands: string[] }>('/api/brands', { signal: controller.signal }),
    ])
      .then(([c, b]) => {
        setCategories(c.categories);
        setBrands(b.brands);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setVisible(9);
    api<{ products: Product[] }>(`/api/products?${key}`, { signal: controller.signal })
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [key, retry]);
  function update(field: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(field, value);
        else next.delete(field);
        return next;
      },
      { replace: true },
    );
  }
  useEffect(() => {
    if (query === (params.get('q') || '')) return;
    const timer = setTimeout(
      () =>
        setParams(
          (current) => {
            const next = new URLSearchParams(current);
            if (query) next.set('q', query);
            else next.delete('q');
            return next;
          },
          { replace: true },
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [query, params, setParams]);
  const count = keys.filter((k) => params.get(k) && k !== 'sort').length;
  return (
    <>
      <SEO
        title="Industrial Product Catalog"
        description="Explore 27 motors, fans, gearboxes, pneumatic components and instruments. Filter by brand, category and industry, then build a product enquiry."
        noindex={!!key}
      />
      <section className="page-header catalog-header">
        <div className="container">
          <span className="eyebrow">GLOBAL BRANDS. PRECISE SOLUTIONS.</span>
          <h1>
            Find your next
            <br />
            <span>industrial advantage.</span>
          </h1>
          <p>Motors to measurement. The components that keep your industry moving.</p>
          <div className="catalog-summary">
            <span>27 PRODUCTS</span>
            <span>6 CATEGORIES</span>
            <span>5 SUPPLY BRANDS</span>
          </div>
        </div>
        <div className="catalog-header-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className="section catalog-section">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="search-field">
              <Search size={20} />
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <input
                id="product-search"
                type="search"
                placeholder="Search a product, brand or application…"
                maxLength={200}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className="button secondary filter-toggle"
              onClick={() => setFilters(!filters)}
              aria-expanded={filters}
              aria-controls="catalog-filters"
            >
              <SlidersHorizontal size={18} />
              Filters {count > 0 && `(${count})`}
            </button>
            <div className="sort-field">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={params.get('sort') || 'featured'}
                onChange={(e) => update('sort', e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="brand">Brand</option>
              </select>
            </div>
          </div>
          <div className="category-chips" aria-label="Product categories">
            <button
              className={!params.get('category') ? 'selected' : ''}
              onClick={() => update('category', '')}
            >
              All products
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={params.get('category') === c ? 'selected' : ''}
                onClick={() => update('category', c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="catalog-layout">
            <aside id="catalog-filters" className={`catalog-filters ${filters ? 'is-open' : ''}`}>
              <div className="filter-heading">
                <h2>Refine your search</h2>
                <SlidersHorizontal size={17} />
              </div>
              {[
                { key: 'brand', label: 'Brand', options: brands },
                { key: 'category', label: 'Category', options: categories },
                {
                  key: 'industry',
                  label: 'Industry served',
                  options: industries.map((i) => i.name),
                },
              ].map((group) => (
                <div className="filter-group" key={group.key}>
                  <label htmlFor={`filter-${group.key}`}>{group.label}</label>
                  <select
                    id={`filter-${group.key}`}
                    value={params.get(group.key) || ''}
                    onChange={(e) => update(group.key, e.target.value)}
                  >
                    <option value="">
                      All{' '}
                      {group.key === 'industry'
                        ? 'industries'
                        : `${group.key === 'category' ? 'categories' : 'brands'}`}
                    </option>
                    {group.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
              {count > 0 && (
                <button
                  className="text-link"
                  onClick={() => {
                    setQuery('');
                    setParams({});
                  }}
                >
                  Clear all filters
                </button>
              )}
              <div className="filter-help">
                <h3>Not sure what you need?</h3>
                <p>Send us your application or nameplate details. We’ll help with selection.</p>
                <button className="text-link" onClick={() => setOpen(true)}>
                  Talk to our team
                </button>
              </div>
            </aside>
            <div className="catalog-results" aria-busy={loading}>
              <h2 className="sr-only">Product results</h2>
              <div className="results-top">
                <p role="status">
                  {loading
                    ? 'Finding your products…'
                    : `${products.length} product${products.length === 1 ? '' : 's'} found`}
                </p>
                <span>Specifications confirmed on enquiry</span>
              </div>
              {count > 0 && (
                <div className="active-filters">
                  {keys
                    .filter((k) => k !== 'sort' && params.get(k))
                    .map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          update(k, '');
                          if (k === 'q') setQuery('');
                        }}
                      >
                        {params.get(k)}
                        <X size={13} />
                        <span className="sr-only">Remove {k} filter</span>
                      </button>
                    ))}
                </div>
              )}
              {loading ? (
                <div className="product-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton" />
                  ))}
                </div>
              ) : error ? (
                <div className="empty-state" role="alert">
                  <h2>We couldn’t load the catalog.</h2>
                  <p>{error}</p>
                  <button className="button primary" onClick={() => setRetry(retry + 1)}>
                    Try again
                  </button>
                </div>
              ) : products.length ? (
                <>
                  <div className="product-grid">
                    {products.slice(0, visible).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                  <div className="load-more">
                    <span>
                      Showing {Math.min(visible, products.length)} of {products.length} products
                    </span>
                    {visible < products.length && (
                      <button className="button secondary" onClick={() => setVisible(visible + 9)}>
                        Load more products
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <PackageSearch size={42} />
                  <h2>No matching products.</h2>
                  <p>
                    Try a different search or clear your filters. We can also source requirements
                    beyond this catalog.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setQuery('');
                      setParams({});
                    }}
                  >
                    Clear filters
                  </button>
                  <button className="text-link" onClick={() => setOpen(true)}>
                    Send a sourcing enquiry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
