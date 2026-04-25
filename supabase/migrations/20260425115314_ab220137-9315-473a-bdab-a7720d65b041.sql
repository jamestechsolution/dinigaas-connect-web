-- Site content key/value store for editable homepage and about copy
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  label text NOT NULL,
  section text NOT NULL DEFAULT 'home',
  multiline boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed editable copy for home + about
INSERT INTO public.site_content (key, label, section, multiline, sort_order, value) VALUES
  ('home_hero_eyebrow', 'Hero eyebrow', 'home', false, 10, 'Community Foundation'),
  ('home_hero_title', 'Hero title', 'home', false, 20, 'Nurturing the future of Sheger City.'),
  ('home_hero_subtitle', 'Hero subtitle', 'home', true, 30, 'From the first steps of KG1 through Grade 8, and from routine checkups to specialized care — Dinigaas Trading S.C. delivers education and healthcare that transforms families and strengthens our community.'),
  ('home_cta_primary', 'Primary CTA label', 'home', false, 40, 'Explore our services'),
  ('home_cta_secondary', 'Secondary CTA label', 'home', false, 50, 'Contact us'),
  ('about_eyebrow', 'About eyebrow', 'about', false, 10, 'About us'),
  ('about_title', 'About title', 'about', false, 20, 'A locally rooted company serving Sheger City.'),
  ('about_intro', 'About intro paragraph', 'about', true, 30, 'Dinigaas Trading S.C. is a community-focused company headquartered in Gefarsa Gujje Kella. We invest in education and healthcare because we believe these are the foundations of every prosperous neighborhood.'),
  ('about_story_p1', 'Our story – paragraph 1', 'about', true, 40, 'Founded with a mission to uplift the families of Sheger City, Dinigaas began with a single school and grew to include healthcare and trading operations. Today we serve hundreds of students and patients every week.'),
  ('about_story_p2', 'Our story – paragraph 2', 'about', true, 50, 'We are proud to employ qualified teachers, nurses and professionals from our local community, ensuring our impact stays close to home.');

-- Create the admin user James
DO $$
DECLARE
  new_uid uuid;
BEGIN
  -- Only insert if not already present
  SELECT id INTO new_uid FROM auth.users WHERE email = 'james@dinigaas.com';
  IF new_uid IS NULL THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      'james@dinigaas.com',
      crypt('yaex@0906', gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',array['email']),
      jsonb_build_object('username','James'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), new_uid,
      jsonb_build_object('sub', new_uid::text, 'email', 'james@dinigaas.com', 'email_verified', true),
      'email', new_uid::text, now(), now(), now()
    );
  END IF;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;