import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import './config.js';
import type { Product } from './data/products.js';

const timedFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    signal: init?.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)])
      : AbortSignal.timeout(10000),
  });

export function databaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY),
  );
}
let client: SupabaseClient | undefined;
export function getDatabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)
    throw new Error('Supabase server configuration is missing');
  return (client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: timedFetch },
  }));
}
let catalogClient: SupabaseClient | undefined;
function getCatalogClient() {
  if (!databaseConfigured()) throw new Error('Supabase catalog configuration is missing');
  return (catalogClient ??= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: timedFetch },
    },
  ));
}

export function productRow(p: Product, sortOrder: number) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    industries: p.industries,
    tagline: p.tagline,
    overview: p.overview,
    features: p.features,
    specs: p.specs,
    applications: p.applications,
    selection_guide: p.selectionGuide ?? null,
    images: p.images,
    low_res: p.lowRes ?? false,
    documents: p.documents ?? [],
    related_slugs: p.relatedSlugs ?? [],
    verified: p.verified,
    specification_note: p.specificationNote ?? null,
    model_table: p.modelTable ?? null,
    sort_order: sortOrder,
    published: true,
  };
}
export type ProductRow = ReturnType<typeof productRow>;
export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    industries: row.industries,
    tagline: row.tagline,
    overview: row.overview,
    features: row.features,
    specs: row.specs,
    applications: row.applications,
    selectionGuide: row.selection_guide ?? undefined,
    images: row.images,
    lowRes: row.low_res,
    documents: row.documents,
    relatedSlugs: row.related_slugs,
    verified: row.verified,
    specificationNote: row.specification_note ?? undefined,
    modelTable: row.model_table ?? undefined,
  };
}
export type SaveArguments = {
  p_key: string;
  p_hash: string;
  p_client_key: string;
  p_kind: 'contact' | 'enquiry';
  p_customer: { name: string; email: string; company: string; phone: string; message: string };
  p_items: { productId: string; quantity: number; notes: string }[];
};
export type SaveResult =
  | { id: string; reference: string; created: boolean }
  | { error: 'INVALID_PRODUCT' | 'IDEMPOTENCY_CONFLICT' | 'RATE_LIMIT'; retryAfter?: number };

export const database = {
  async listProducts(): Promise<Product[]> {
    const rows: Product[] = [];
    // Page explicitly: Supabase's default REST row limit is 1,000.
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await getCatalogClient()
        .from('products')
        .select('*')
        .eq('published', true)
        .order('sort_order')
        .order('id')
        .range(offset, offset + 499);
      if (error) throw new Error('Catalog database read failed');
      rows.push(...(data as ProductRow[]).map(productFromRow));
      if (data.length < 500) return rows;
    }
  },
  async saveQuote(args: SaveArguments): Promise<SaveResult> {
    const { data, error } = await getDatabaseClient().rpc('save_quote_request', args);
    if (error || !data) throw new Error('Quote database save failed');
    return data as SaveResult;
  },
  async setNotification(id: string, status: 'sent' | 'failed' | 'not_configured') {
    const { error } = await getDatabaseClient()
      .from('quote_requests')
      .update({ notification_status: status })
      .eq('id', id);
    if (error) throw new Error('Quote notification status update failed');
  },
  async health() {
    const checks = await Promise.all([
      getCatalogClient().from('products').select('id').limit(1),
      getDatabaseClient().from('quote_requests').select('id').limit(0),
    ]);
    if (checks.some(({ error }) => error)) throw new Error('Database readiness check failed');
  },
};
