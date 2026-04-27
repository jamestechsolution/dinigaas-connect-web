-- History table for status changes
CREATE TABLE public.student_registration_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_srsh_registration_id ON public.student_registration_status_history(registration_id);
CREATE INDEX idx_srsh_created_at ON public.student_registration_status_history(created_at DESC);

ALTER TABLE public.student_registration_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read status history"
  ON public.student_registration_status_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins insert status history"
  ON public.student_registration_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Trigger function: log initial status on insert and any status change on update
CREATE OR REPLACE FUNCTION public.log_student_registration_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.student_registration_status_history (registration_id, from_status, to_status, changed_by, note)
    VALUES (NEW.id, NULL, COALESCE(NEW.status, 'pending'), auth.uid(), 'Registration submitted');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.student_registration_status_history (registration_id, from_status, to_status, changed_by, note)
      VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NULL);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_student_registration_status_change
AFTER INSERT OR UPDATE ON public.student_registrations
FOR EACH ROW
EXECUTE FUNCTION public.log_student_registration_status_change();

-- Backfill: create an initial history entry for any existing registrations that don't have one
INSERT INTO public.student_registration_status_history (registration_id, from_status, to_status, changed_by, note, created_at)
SELECT sr.id, NULL, COALESCE(sr.status, 'pending'), NULL, 'Backfilled initial status', sr.created_at
FROM public.student_registrations sr
LEFT JOIN public.student_registration_status_history h ON h.registration_id = sr.id
WHERE h.id IS NULL;