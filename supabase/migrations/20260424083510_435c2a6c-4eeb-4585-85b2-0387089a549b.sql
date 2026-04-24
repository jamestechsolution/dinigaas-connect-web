
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create policy "Admins can manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Products / Catalog
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select using (true);
create policy "Admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();

-- News
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  image_url text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.news enable row level security;
create policy "Anyone can view published news" on public.news for select using (published = true);
create policy "Admins manage news" on public.news for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger news_updated before update on public.news for each row execute function public.set_updated_at();

-- Careers
create table public.careers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null default 'Sheger City, Gefarsa Gujje Kella',
  type text not null default 'Full-time',
  description text not null,
  requirements text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.careers enable row level security;
create policy "Anyone can view active careers" on public.careers for select using (active = true);
create policy "Admins manage careers" on public.careers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger careers_updated before update on public.careers for each row execute function public.set_updated_at();

-- Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can submit contact messages" on public.contact_messages for insert with check (true);
create policy "Admins read messages" on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins update messages" on public.contact_messages for update to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- Newsletter subscribers
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Admins read subscribers" on public.newsletter_subscribers for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete subscribers" on public.newsletter_subscribers for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));
