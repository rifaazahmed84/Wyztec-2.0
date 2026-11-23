import { products, productIdAliases } from '../data/products.js';
import { productSlugAliases } from '../data/product-replacements.js';
export type ProductQuery = {
  q?: string;
  brand?: string;
  category?: string;
  industry?: string;
  sort?: string;
};
// Repository boundary: replace this module with a database adapter without changing API routes.
export const productRepository = {
  list(query: ProductQuery) {
    const q = query.q?.toLowerCase().trim();
    const result = products.filter(
      (p) =>
        (!q || `${p.name} ${p.brand} ${p.category} ${p.tagline}`.toLowerCase().includes(q)) &&
        (!query.brand || p.brand === query.brand) &&
        (!query.category || p.category === query.category) &&
        (!query.industry || p.industries.includes(query.industry)),
    );
    if (query.sort === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    else if (query.sort === 'brand')
      result.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
    else if (query.sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  },
  bySlug: (slug: string) => products.find((p) => p.slug === (productSlugAliases[slug] ?? slug)),
  byId: (id: string) => products.find((p) => p.id === (productIdAliases[id] ?? id)),
  categories: () => [...new Set(products.map((p) => p.category))],
  brands: () => [...new Set(products.map((p) => p.brand))],
};
