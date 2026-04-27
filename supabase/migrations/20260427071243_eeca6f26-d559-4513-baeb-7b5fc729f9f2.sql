-- Student registration submissions by parents
CREATE TABLE public.student_registrations (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,
  relationship text not null default 'Parent',
  student_first_name text not null,
  student_last_name text not null,
  student_date_of_birth date not null,
  student_gender text not null,
  grade_applying_for text not null,
  previous_school text,
  address text,
  notes text,
  status text not null default 'pending',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;

-- Public can submit (with validation)
CREATE POLICY "Public can submit valid student registrations"
ON public.student_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(parent_name)) between 1 and 100
  AND length(trim(parent_email)) between 3 and 255
  AND parent_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(parent_phone)) between 5 and 30
  AND length(trim(student_first_name)) between 1 and 100
  AND length(trim(student_last_name)) between 1 and 100
  AND length(trim(student_gender)) between 1 and 20
  AND length(trim(grade_applying_for)) between 1 and 50
);

-- Admins manage
CREATE POLICY "Admins read student registrations"
ON public.student_registrations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update student registrations"
ON public.student_registrations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete student registrations"
ON public.student_registrations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER trg_student_registrations_updated_at
BEFORE UPDATE ON public.student_registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();