-- Storage bucket for admin media uploads
insert into storage.buckets (id, name, public)
values ('site_media', 'site_media', true)
on conflict (id) do nothing;

create policy "Public can view site media"
  on storage.objects for select
  using (bucket_id = 'site_media');

create policy "Admins upload site media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site_media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update site media"
  on storage.objects for update to authenticated
  using (bucket_id = 'site_media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete site media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site_media' and public.has_role(auth.uid(), 'admin'));

-- site_images: maps a known slot to an image URL
create table public.site_images (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique,
  label text not null,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.site_images enable row level security;

create policy "Anyone can read site images"
  on public.site_images for select using (true);

create policy "Admins manage site images"
  on public.site_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_site_images_updated_at
  before update on public.site_images
  for each row execute function public.set_updated_at();

insert into public.site_images (slot, label) values
  ('home_hero', 'Homepage hero image'),
  ('home_story', 'Homepage story image'),
  ('home_health', 'Homepage healthcare image'),
  ('about_story', 'About page image');

-- nav_items: editable header navigation
create table public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  path text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nav_items enable row level security;

create policy "Anyone can read active nav items"
  on public.nav_items for select using (active = true);

create policy "Admins manage nav items"
  on public.nav_items for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_nav_items_updated_at
  before update on public.nav_items
  for each row execute function public.set_updated_at();

insert into public.nav_items (label, path, sort_order) values
  ('Home', '/', 1),
  ('About', '/about', 2),
  ('Services', '/services', 3),
  ('Products', '/products', 4),
  ('News', '/news', 5),
  ('Careers', '/careers', 6);