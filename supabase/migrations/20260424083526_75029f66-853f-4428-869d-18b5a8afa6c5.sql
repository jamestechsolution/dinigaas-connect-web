
-- Fix function search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- Tighten public insert policies
drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Public can submit valid contact messages"
on public.contact_messages for insert to anon, authenticated
with check (
  length(trim(name)) between 1 and 100
  and length(trim(email)) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(subject)) between 1 and 200
  and length(trim(message)) between 1 and 5000
);

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Public can subscribe with valid email"
on public.newsletter_subscribers for insert to anon, authenticated
with check (
  length(trim(email)) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);
