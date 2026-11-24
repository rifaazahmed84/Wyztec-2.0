-- Apply with the Supabase CLI. No customer data or secrets are in this migration.
begin;

create table public.products (
  id text primary key check (length(id) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(name) between 1 and 200),
  brand text not null,
  category text not null,
  industries text[] not null default '{}',
  tagline text not null default '',
  overview text not null default '',
  features text[] not null default '{}',
  specs jsonb not null default '[]' check (jsonb_typeof(specs) = 'array'),
  applications text[] not null default '{}',
  selection_guide text,
  images jsonb not null check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) > 0),
  low_res boolean not null default false,
  documents jsonb not null default '[]' check (jsonb_typeof(documents) = 'array'),
  related_slugs text[] not null default '{}',
  verified boolean not null default false,
  specification_note text,
  model_table jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_published_sort on public.products (sort_order, id) where published;

create function public.touch_product_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger products_updated before update on public.products
for each row execute function public.touch_product_updated_at();

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('WYZ-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  idempotency_key uuid not null unique,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  submitted_at timestamptz not null default now(),
  kind text not null check (kind in ('contact', 'enquiry')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'closed')),
  name text not null check (length(name) between 1 and 100),
  email text not null check (length(email) between 3 and 254),
  company text not null check (length(company) between 1 and 160),
  phone text not null default '' check (length(phone) <= 30),
  requirements text not null check (length(requirements) between 5 and 5000),
  staff_notes text not null default '',
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_configured'))
);
create index quote_requests_review on public.quote_requests (status, submitted_at desc);

-- A request can contain several products from the existing enquiry basket.
-- Keep snapshots so sales can see what the visitor requested after catalog edits.
create table public.quote_request_items (
  id bigint generated always as identity primary key,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 9999),
  notes text not null default '' check (length(notes) <= 1000),
  product_name text not null,
  product_brand text not null,
  product_slug text not null,
  unique (quote_request_id, product_id)
);

create table public.quote_rate_limits (
  client_key text primary key check (client_key ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  hits integer not null check (hits > 0)
);

alter table public.products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;
alter table public.quote_rate_limits enable row level security;

-- Explicit grants matter: existing Supabase projects may grant public-schema tables by default.
revoke all on public.products, public.quote_requests, public.quote_request_items, public.quote_rate_limits from public, anon, authenticated;
revoke all on sequence public.quote_request_items_id_seq from public, anon, authenticated;
grant select on public.products to anon, authenticated;
create policy published_products_only on public.products for select to anon, authenticated using (published = true);
-- No browser writes, no browser enquiry reads, and no application-user staff policy.
-- Authorized project staff use Supabase Dashboard with project access controls.
grant all on public.products, public.quote_requests, public.quote_request_items, public.quote_rate_limits to service_role;
grant usage, select on sequence public.quote_request_items_id_seq to service_role;

create function public.save_quote_request(
  p_key uuid, p_hash text, p_client_key text, p_kind text, p_customer jsonb, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  existing public.quote_requests%rowtype;
  saved public.quote_requests%rowtype;
  quota public.quote_rate_limits%rowtype;
  item jsonb;
  selected public.products%rowtype;
  current_time_value timestamptz := clock_timestamp();
begin
  -- Serialize the same key across all API instances. The unique constraint is a second guard.
  perform pg_advisory_xact_lock(hashtextextended(p_key::text, 0));
  select * into existing from public.quote_requests where idempotency_key = p_key;
  if found then
    if existing.payload_hash <> p_hash then
      return jsonb_build_object('error', 'IDEMPOTENCY_CONFLICT');
    end if;
    return jsonb_build_object('id', existing.id, 'reference', existing.public_reference, 'created', false);
  end if;

  if p_kind not in ('contact', 'enquiry') or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) > 50
     or (p_kind = 'enquiry' and jsonb_array_length(p_items) = 0)
     or (p_kind = 'contact' and jsonb_array_length(p_items) <> 0) then
    raise exception 'Invalid request' using errcode = '22023';
  end if;

  -- Validate visibility in the transaction, including legacy IDs resolved by the server.
  for item in select value from jsonb_array_elements(p_items) loop
    select * into selected from public.products where id = item->>'productId' and published for share;
    if not found then
      return jsonb_build_object('error', 'INVALID_PRODUCT');
    end if;
  end loop;

  -- A fixed 60-second window, shared by all instances. IPs are HMACed on the server.
  insert into public.quote_rate_limits as limits (client_key, window_start, hits)
    values (p_client_key, current_time_value, 1)
  on conflict (client_key) do update set
    hits = case when limits.window_start <= current_time_value - interval '60 seconds' then 1 else least(limits.hits + 1, 6) end,
    window_start = case when limits.window_start <= current_time_value - interval '60 seconds' then current_time_value else limits.window_start end
  returning * into quota;
  if quota.hits > 5 then
    return jsonb_build_object('error', 'RATE_LIMIT', 'retryAfter', greatest(1, ceil(extract(epoch from quota.window_start + interval '60 seconds' - current_time_value))));
  end if;
  delete from public.quote_rate_limits where window_start < current_time_value - interval '1 day';

  insert into public.quote_requests (idempotency_key, payload_hash, kind, name, email, company, phone, requirements)
    values (p_key, p_hash, p_kind, p_customer->>'name', p_customer->>'email', p_customer->>'company', coalesce(p_customer->>'phone', ''), p_customer->>'message')
    returning * into saved;
  for item in select value from jsonb_array_elements(p_items) loop
    insert into public.quote_request_items (quote_request_id, product_id, quantity, notes, product_name, product_brand, product_slug)
    select saved.id, id, (item->>'quantity')::integer, coalesce(item->>'notes', ''), name, brand, slug
      from public.products where id = item->>'productId';
  end loop;
  return jsonb_build_object('id', saved.id, 'reference', saved.public_reference, 'created', true);
end;
$$;

revoke all on function public.touch_product_updated_at() from public, anon, authenticated;
revoke all on function public.save_quote_request(uuid, text, text, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_quote_request(uuid, text, text, text, jsonb, jsonb) to service_role;
commit;
