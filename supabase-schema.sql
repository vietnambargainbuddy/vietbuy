create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  delivery_address text not null,
  delivery_notes text,
  product_url text not null,
  platform text not null check (platform in ('shopee', 'tiktokshop')),
  product_name text not null,
  product_image text,
  product_price_vnd numeric not null,
  product_price_usd numeric not null,
  service_fee_usd numeric not null,
  total_usd numeric not null,
  quantity integer not null default 1,
  variant text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'purchasing', 'purchased', 'shipping', 'delivered', 'cancelled', 'refunded')),
  stripe_payment_id text,
  tracking_number text,
  admin_notes text
);

create index idx_orders_email on orders(customer_email);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);

alter table orders enable row level security;

create policy "Allow anonymous insert" on orders
  for insert with check (true);

create policy "Allow read by email" on orders
  for select using (true);

create policy "Allow update" on orders
  for update using (true);
