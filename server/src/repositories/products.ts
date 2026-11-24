import { products, productIdAliases } from '../data/products.js';
import { productSlugAliases } from '../data/product-replacements.js';
import { database, databaseConfigured } from '../database.js';
import { config } from '../config.js';
export type ProductQuery = {
  q?: string;
  brand?: string;
  category?: string;
  industry?: string;
  sort?: string;
};
async function catalog() {
  if (databaseConfigured() || config.production) return database.listProducts();
  // Browsing-only local preview. Enquiries always require a confirmed database save.
  return products;
}
export const productRepository = {
  async list(query: ProductQuery) {
    const q = query.q?.toLowerCase().trim();
    const result = (await catalog()).filter(
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
  bySlug: async (slug: string) =>
    (await catalog()).find((p) => p.slug === (productSlugAliases[slug] ?? slug)),
  byId: async (id: string) => (await catalog()).find((p) => p.id === (productIdAliases[id] ?? id)),
  categories: async () => [...new Set((await catalog()).map((p) => p.category))],
  brands: async () => [...new Set((await catalog()).map((p) => p.brand))],
};
