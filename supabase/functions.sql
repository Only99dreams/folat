-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  FOLAT — Helper Functions                                        ║
-- ║  Run this AFTER schema.sql in the Supabase SQL Editor            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Generate sequential member IDs (e.g. FOL-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text LANGUAGE sql AS $$
  SELECT 'FOL-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((COALESCE(MAX(CAST(SPLIT_PART(member_id, '-', 3) AS integer)), 0) + 1)::text, 4, '0') FROM public.members
$$;

-- Generate sequential loan IDs (e.g. LN-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_loan_id()
RETURNS text LANGUAGE sql AS $$
  SELECT 'LN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((COALESCE(MAX(CAST(SPLIT_PART(loan_id, '-', 3) AS integer)), 0) + 1)::text, 4, '0') FROM public.loan_applications
$$;

-- Generate sequential transaction IDs (e.g. TXN-20260418-0001)
CREATE OR REPLACE FUNCTION public.generate_transaction_id()
RETURNS text LANGUAGE sql AS $$
  SELECT 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((COALESCE(MAX(CAST(SPLIT_PART(transaction_id, '-', 3) AS integer)), 0) + 1)::text, 4, '0') FROM public.savings_transactions
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- COOPERATIVE MEMBERS (staff-only link)
-- Link the members table to the staff table so cooperative members are
-- always backed by a staff record.  Safe to run multiple times.
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES public.staff(id);
CREATE INDEX IF NOT EXISTS idx_members_staff_id ON public.members(staff_id);

-- External members must belong to a group.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'members_external_group_required'
      AND conrelid = 'public.members'::regclass
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_external_group_required
      CHECK (member_type <> 'external' OR group_id IS NOT NULL)
      NOT VALID;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_external_member_group()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_group_leader_id uuid;
BEGIN
  IF NEW.member_type <> 'external' THEN
    RETURN NEW;
  END IF;

  IF NEW.group_id IS NULL THEN
    RAISE EXCEPTION 'External members must belong to a group.';
  END IF;

  SELECT leader_id
  INTO v_group_leader_id
  FROM public.groups
  WHERE id = NEW.group_id;

  IF v_group_leader_id IS NULL THEN
    RAISE EXCEPTION 'External members can only be assigned to groups that have a group leader.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_external_member_group ON public.members;
CREATE TRIGGER trg_validate_external_member_group
BEFORE INSERT OR UPDATE OF member_type, group_id ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.validate_external_member_group();

CREATE OR REPLACE FUNCTION public.validate_external_group_loan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_member_type text;
  v_member_group_id uuid;
  v_group_leader_id uuid;
BEGIN
  SELECT member_type, group_id
  INTO v_member_type, v_member_group_id
  FROM public.members
  WHERE id = NEW.member_id;

  IF v_member_type <> 'external' THEN
    RETURN NEW;
  END IF;

  IF v_member_group_id IS NULL THEN
    RAISE EXCEPTION 'External member must belong to a group before applying for a loan.';
  END IF;

  IF NEW.loan_type <> 'group' THEN
    RAISE EXCEPTION 'External member loans must be submitted as group loans.';
  END IF;

  IF NEW.group_id IS NULL OR NEW.group_id <> v_member_group_id THEN
    RAISE EXCEPTION 'External group loan must use the member''s assigned group.';
  END IF;

  SELECT leader_id
  INTO v_group_leader_id
  FROM public.groups
  WHERE id = v_member_group_id;

  IF v_group_leader_id IS NULL THEN
    RAISE EXCEPTION 'The member''s group does not have a group leader.';
  END IF;

  IF v_group_leader_id <> NEW.member_id THEN
    RAISE EXCEPTION 'Only the group leader can apply for a loan on behalf of the group.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_external_group_loan ON public.loan_applications;
CREATE TRIGGER trg_validate_external_group_loan
BEFORE INSERT OR UPDATE OF member_id, group_id, loan_type ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.validate_external_group_loan();

-- ──────────────────────────────────────────────────────────────────────────
-- Count the number of distinct calendar months in which a member made at
-- least one savings deposit.  Used to enforce the 6-month eligibility rule.
-- ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.count_savings_months(p_member_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT TO_CHAR(created_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM'))::integer
  FROM   public.savings_transactions
  WHERE  member_id = p_member_id
    AND  type      = 'deposit';
$$;

-- Create an in-app notification when a new inbox message arrives.
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
  push_enabled boolean;
BEGIN
  IF NEW.folder <> 'inbox' OR NEW.recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(np.push_notifications, true)
  INTO push_enabled
  FROM public.notification_preferences np
  WHERE np.user_id = NEW.recipient_id;

  IF push_enabled = false THEN
    RETURN NEW;
  END IF;

  SELECT p.full_name
  INTO sender_name
  FROM public.profiles p
  WHERE p.id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (
    NEW.recipient_id,
    COALESCE(NULLIF(NEW.subject, ''), 'New Message'),
    COALESCE(sender_name, 'Someone') || ': ' || LEFT(COALESCE(NEW.body, ''), 120),
    'info',
    '/communication/messages'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_new_message ON public.messages;
CREATE TRIGGER trg_notify_on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_message();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END;
$$;
