-- Run this in Supabase SQL Editor to add missing guarantor columns
-- This is safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_phone text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_email text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_staff_id uuid REFERENCES public.staff(id);
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_eligibility text DEFAULT 'not_eligible';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approval_status text DEFAULT 'pending';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approval_note text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approved_at timestamptz;

ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_phone text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_email text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_staff_id uuid REFERENCES public.staff(id);
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_eligibility text DEFAULT 'not_eligible';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approval_status text DEFAULT 'pending';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approval_note text DEFAULT '';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approved_at timestamptz;

-- Ensure existing loans have 'pending' as default for approval status
UPDATE public.loan_applications SET guarantor1_approval_status = 'pending' WHERE guarantor1_approval_status IS NULL AND guarantor1_name != '';
UPDATE public.loan_applications SET guarantor2_approval_status = 'pending' WHERE guarantor2_approval_status IS NULL AND guarantor2_name != '';

-- Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loan_applications_guarantor1_approval_status_check') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor1_approval_status_check
      CHECK (guarantor1_approval_status IN ('pending','approved','rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loan_applications_guarantor2_approval_status_check') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor2_approval_status_check
      CHECK (guarantor2_approval_status IN ('pending','approved','rejected'));
  END IF;
END $$;
