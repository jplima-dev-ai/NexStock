begin;

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile_key text not null,
  locale text not null default 'pt-BR',
  currency char(3) not null default 'BRL',
  timezone text not null default 'UTC',
  experience_mode text not null default 'guided',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.meta (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists public.categories (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, code text not null, description text not null default '',
  created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.suppliers (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, contact_name text not null default '', email text not null default '', phone text not null default '', notes text not null default '',
  created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.products (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null, supplier_id uuid references public.suppliers(id) on delete set null,
  name text not null, nex_code text not null, description text not null default '', tracking_mode text not null default 'bulk',
  current_quantity numeric(18,4) not null default 0, minimum_stock numeric(18,4) not null default 0,
  purchase_price numeric(18,2) not null default 0, sale_price numeric(18,2) not null default 0,
  location text not null default '', custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.product_units (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, serial_number text not null,
  condition text not null default 'new', lifecycle_state text not null default 'in_stock',
  warranty_start date, warranty_end date, custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.stock_batches (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, batch_number text not null,
  quantity numeric(18,4) not null default 0, manufacture_date date, expiry_date date,
  created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.stock_movements (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_unit_id uuid references public.product_units(id) on delete restrict,
  batch_id uuid references public.stock_batches(id) on delete restrict,
  type text not null, quantity numeric(18,4) not null, before_quantity numeric(18,4) not null, after_quantity numeric(18,4) not null,
  reason text not null, notes text not null default '', created_at timestamptz not null
);

create table if not exists public.audit_logs (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null, entity_id uuid not null, action text not null,
  before_data jsonb, after_data jsonb, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null
);

create table if not exists public.product_relations (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_product_id uuid not null references public.products(id) on delete cascade,
  target_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null, notes text not null default '', created_at timestamptz not null
);

create table if not exists public.kits (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, description text not null default '', created_at timestamptz not null, updated_at timestamptz not null, archived_at timestamptz
);

create table if not exists public.kit_items (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kit_id uuid not null references public.kits(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_required numeric(18,4) not null
);

create table if not exists public.custom_field_definitions (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_key text not null, key text not null, label text not null, type text not null,
  required boolean not null default false, options jsonb not null default '[]'::jsonb,
  searchable boolean not null default false, sort_order integer not null default 0, enabled boolean not null default true,
  created_at timestamptz not null, updated_at timestamptz not null
);

create table if not exists public.settings (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  value jsonb, updated_at timestamptz not null,
  primary key (user_id, id)
);

create table if not exists public.sync_queue (
  id uuid primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
  operation text not null, entity_type text not null, entity_id uuid not null, payload jsonb not null,
  created_at timestamptz not null, retry_count integer not null default 0, status text not null default 'pending'
);

commit;
