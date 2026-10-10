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
  SELECT COUNT(DISTINCT TO_CHAR(COALESCE(savings_month, created_at AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM'))::integer
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
  ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin','branch_manager','finance_officer','loan_officer','staff_member','front_desk','auditor','hr_manager','unassigned'));

  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_staff_id uuid REFERENCES public.staff(id);
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_email text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_phone text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_eligibility text DEFAULT 'not_eligible';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approval_status text DEFAULT 'pending';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approval_note text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor1_approved_at timestamptz;
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_staff_id uuid REFERENCES public.staff(id);
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_email text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_phone text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_eligibility text DEFAULT 'not_eligible';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approval_status text DEFAULT 'pending';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approval_note text DEFAULT '';
  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS guarantor2_approved_at timestamptz;

  ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS guarantor_eligible boolean NOT NULL DEFAULT false;

  -- Manual "months saved" override used for cooperative loan eligibility.
  ALTER TABLE public.members ADD COLUMN IF NOT EXISTS savings_months integer;
  ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS savings_months integer;

  ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS outstanding_balance numeric(15,2) NOT NULL DEFAULT 0;

  -- Code of Conduct acceptance flag
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coc_accepted boolean NOT NULL DEFAULT false;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'loan_applications_guarantor1_approval_status_check'
      AND conrelid = 'public.loan_applications'::regclass
  ) THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor1_approval_status_check
      CHECK (guarantor1_approval_status IN ('pending','approved','rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'loan_applications_guarantor2_approval_status_check'
      AND conrelid = 'public.loan_applications'::regclass
  ) THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor2_approval_status_check
      CHECK (guarantor2_approval_status IN ('pending','approved','rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'loan_applications_guarantor1_eligibility_check'
      AND conrelid = 'public.loan_applications'::regclass
  ) THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor1_eligibility_check
      CHECK (guarantor1_eligibility IN ('eligible','not_eligible'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'loan_applications_guarantor2_eligibility_check'
      AND conrelid = 'public.loan_applications'::regclass
  ) THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT loan_applications_guarantor2_eligibility_check
      CHECK (guarantor2_eligibility IN ('eligible','not_eligible'));
  END IF;

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

-- ──────────────────────────────────────────────────────────────────────────
-- SALARY DEDUCTION HELPERS
-- ──────────────────────────────────────────────────────────────────────────

-- Generate sequential deduction IDs (e.g. DED-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_deduction_id()
RETURNS text LANGUAGE sql AS $$
  SELECT 'DED-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((COALESCE(MAX(CAST(SPLIT_PART(reference, '-', 3) AS integer)), 0) + 1)::text, 4, '0') FROM public.salary_deductions
$$;

-- Process monthly salary deductions for a specific staff member
-- Returns the created deduction records
CREATE OR REPLACE FUNCTION public.process_monthly_salary_deductions(
  p_staff_id uuid,
  p_month date DEFAULT DATE_TRUNC('month', CURRENT_DATE)::date
)
RETURNS TABLE (
  id uuid,
  deduction_type text,
  amount numeric,
  status text
) LANGUAGE plpgsql AS $$
DECLARE
  v_staff record;
  v_member_id uuid;
  v_savings_deduction numeric := 0;
  v_loan_deduction numeric := 0;
  v_deduction_id uuid;
BEGIN
  -- Get staff details
  SELECT * INTO v_staff FROM public.staff WHERE id = p_staff_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Find linked member record
  SELECT id INTO v_member_id FROM public.members 
  WHERE staff_id = p_staff_id AND member_type = 'cooperative' LIMIT 1;

  -- Calculate savings deduction (10% of gross salary if cooperative member)
  IF v_staff.is_cooperative_member THEN
    v_savings_deduction := (v_staff.basic_salary + v_staff.housing_allowance + v_staff.transport_allowance + v_staff.other_allowances) * (v_staff.cooperative_savings_rate / 100.0);
  END IF;

  -- Calculate loan repayment deduction
  v_loan_deduction := COALESCE(v_staff.loan_repayment_amount, 0);

  -- Create savings deduction if applicable
  IF v_savings_deduction > 0 AND v_member_id IS NOT NULL THEN
    INSERT INTO public.salary_deductions (
      staff_id, member_id, deduction_type, amount, month, status, reference
    ) VALUES (
      p_staff_id, v_member_id, 'savings', v_savings_deduction, p_month, 'pending', 
      public.generate_deduction_id()
    ) RETURNING id INTO v_deduction_id;
    
    RETURN QUERY SELECT v_deduction_id, 'savings'::text, v_savings_deduction, 'pending'::text;
  END IF;

  -- Create loan repayment deduction if applicable
  IF v_loan_deduction > 0 THEN
    INSERT INTO public.salary_deductions (
      staff_id, member_id, deduction_type, amount, month, status, reference
    ) VALUES (
      p_staff_id, v_member_id, 'loan_repayment', v_loan_deduction, p_month, 'pending',
      public.generate_deduction_id()
    ) RETURNING id INTO v_deduction_id;
    
    RETURN QUERY SELECT v_deduction_id, 'loan_repayment'::text, v_loan_deduction, 'pending'::text;
  END IF;
END;
$$;

-- Get all staff assigned to a specific branch (manager, secretary, or all staff in branch)
CREATE OR REPLACE FUNCTION public.get_branch_staff(
  p_branch_id uuid,
  p_assignment_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  staff_id text,
  first_name text,
  last_name text,
  email text,
  job_role text,
  employment_status text,
  assignment_type text
) LANGUAGE sql AS $$
  SELECT 
    s.id,
    s.staff_id,
    s.first_name,
    s.last_name,
    s.email,
    s.job_role,
    s.employment_status,
    ba.assignment_type
  FROM public.staff s
  LEFT JOIN public.branch_assignments ba ON ba.staff_id = s.id AND ba.branch_id = p_branch_id
    AND (p_assignment_type IS NULL OR ba.assignment_type = p_assignment_type)
  WHERE s.branch_id = p_branch_id
    AND (p_assignment_type IS NULL OR ba.assignment_type = p_assignment_type)
  ORDER BY s.first_name, s.last_name;
$$;

-- Check if current user is assigned as branch manager or secretary for a branch
CREATE OR REPLACE FUNCTION public.is_branch_assigned(
  p_branch_id uuid,
  p_staff_id uuid DEFAULT NULL
)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branch_assignments
    WHERE branch_id = p_branch_id
      AND staff_id = COALESCE(p_staff_id, auth.uid()::uuid)
      AND assignment_type IN ('branch_manager', 'secretary', 'officer')
  );
$$;

-- Get branches assigned to current user
CREATE OR REPLACE FUNCTION public.get_my_branches(
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE (
  branch_id uuid,
  branch_name text,
  assignment_type text
) LANGUAGE sql STABLE AS $$
  SELECT 
    b.id as branch_id,
    b.name as branch_name,
    ba.assignment_type
  FROM public.branch_assignments ba
   JOIN public.branches b ON b.id = ba.branch_id
   WHERE ba.staff_id = COALESCE(p_staff_id, auth.uid()::uuid)
   ORDER BY b.name;
$$;

-- ============================================================================
-- PAYROLL DEDUCTIONS (MANUAL)
-- ============================================================================
-- This batch function processes monthly salary deductions for active staff.
-- Savings deductions are NO LONGER automatic — they must be triggered manually.
-- Loan repayments are still processed automatically when this function is called.
--
-- TO RUN MANUALLY (when ready to process deductions for a month):
--    SELECT * FROM public.process_all_monthly_deductions(DATE_TRUNC('month', CURRENT_DATE)::date);
--
-- NOTE: The old automatic cron job has been removed. If it still exists in your
-- database, unschedule it with:
--    SELECT cron.unschedule('monthly-salary-deductions');
-- ============================================================================

-- Batch process monthly salary deductions for all active staff
CREATE OR REPLACE FUNCTION public.process_all_monthly_deductions(
  p_month date DEFAULT DATE_TRUNC('month', CURRENT_DATE)::date
)
RETURNS TABLE (
  total_staff bigint,
  total_savings numeric,
  total_loan_repayments numeric,
  total_deducted numeric
) LANGUAGE plpgsql AS $$
DECLARE
  v_staff record;
  v_loan record;
  v_savings_deduction numeric;
  v_loan_deduction numeric;
  v_remaining_deduction numeric;
  v_loan_payment numeric;
  v_member_id uuid;
  v_deduction_id uuid;
  v_total_staff bigint := 0;
  v_total_savings numeric := 0;
  v_total_loan_repayments numeric := 0;
BEGIN
  FOR v_staff IN 
    SELECT * FROM public.staff WHERE employment_status = 'active'
  LOOP
    SELECT id INTO v_member_id FROM public.members 
    WHERE staff_id = v_staff.id AND member_type = 'cooperative' LIMIT 1;

    -- Savings deductions are now MANUAL only — no automatic additions.
    -- To add savings manually, insert into salary_deductions directly or
    -- use the savings deposit UI for the specific member.
    v_savings_deduction := 0;

    SELECT least(
      coalesce(v_staff.loan_repayment_amount, 0),
      coalesce(sum(outstanding_balance), 0)
    ) INTO v_loan_deduction
    FROM public.loan_applications
    WHERE member_id = v_member_id AND status IN ('disbursed', 'active', 'overdue');

    IF v_savings_deduction > 0 AND v_member_id IS NOT NULL THEN
      INSERT INTO public.salary_deductions (
        staff_id, member_id, deduction_type, amount, month, status, reference
      ) VALUES (
        v_staff.id, v_member_id, 'savings', v_savings_deduction, p_month, 'processed', 
        public.generate_deduction_id()
      ) RETURNING id INTO v_deduction_id;
      
      -- Update savings account balance
      UPDATE public.savings_accounts 
      SET balance = balance + v_savings_deduction, updated_at = now()
      WHERE member_id = v_member_id;
      
      v_total_savings := v_total_savings + v_savings_deduction;
    END IF;

    IF v_loan_deduction > 0 THEN
      INSERT INTO public.salary_deductions (
        staff_id, member_id, deduction_type, amount, month, status, reference
      ) VALUES (
        v_staff.id, v_member_id, 'loan_repayment', v_loan_deduction, p_month, 'processed',
        public.generate_deduction_id()
      ) RETURNING id INTO v_deduction_id;
      
      v_remaining_deduction := v_loan_deduction;
      FOR v_loan IN
        SELECT id, member_id, outstanding_balance
        FROM public.loan_applications
        WHERE member_id = v_member_id
          AND status IN ('disbursed', 'active', 'overdue')
          AND outstanding_balance > 0
        ORDER BY created_at
        FOR UPDATE
      LOOP
        v_loan_payment := least(v_remaining_deduction, v_loan.outstanding_balance);
        IF v_loan_payment > 0 THEN
          PERFORM public.record_loan_repayment(
            v_loan.id,
            v_loan.member_id,
            v_loan_payment,
            'Salary Deduction',
            v_deduction_id::text,
            'Monthly salary deduction',
            NULL,
            p_month,
            'REP-' || to_char(p_month, 'YYYYMMDD') || '-' || lpad((floor(random() * 9000)::integer + 1000)::text, 4, '0')
          );
          v_remaining_deduction := v_remaining_deduction - v_loan_payment;
        END IF;
        EXIT WHEN v_remaining_deduction <= 0;
      END LOOP;
      
      v_total_loan_repayments := v_total_loan_repayments + v_loan_deduction;
    END IF;

    IF v_savings_deduction > 0 OR v_loan_deduction > 0 THEN
      v_total_staff := v_total_staff + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT 
    v_total_staff, 
    v_total_savings, 
    v_total_loan_repayments, 
    v_total_savings + v_total_loan_repayments;
END;
$$;

-- Record a loan repayment atomically across the payment ledger, schedule, and loan balance.
CREATE OR REPLACE FUNCTION public.record_loan_repayment(
  p_loan_id uuid,
  p_member_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_notes text,
  p_recorded_by uuid,
  p_paid_date date,
  p_repayment_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_loan public.loan_applications%ROWTYPE;
  v_installment public.loan_schedule%ROWTYPE;
  v_last_installment public.loan_schedule%ROWTYPE;
  v_repayment public.loan_repayments%ROWTYPE;
  v_staff_id uuid;
  v_payment numeric(15,2);
  v_remaining numeric(15,2);
  v_applied numeric(15,2);
  v_due_remaining numeric(15,2);
  v_new_paid numeric(15,2);
  v_outstanding numeric(15,2);
  v_outstanding_after numeric(15,2);
  v_principal_portion numeric(15,2) := 0;
  v_interest_portion numeric(15,2) := 0;
  v_installment_number integer;
  v_due_date date;
BEGIN
  v_payment := round(p_amount, 2);
  IF v_payment IS NULL OR v_payment <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero.';
  END IF;

  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'finance_officer', 'loan_officer', 'branch_manager', 'secretary', 'officer')
  ) THEN
    RAISE EXCEPTION 'You are not permitted to record loan repayments.';
  END IF;

  SELECT * INTO v_loan
  FROM public.loan_applications
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found.';
  END IF;
  IF v_loan.member_id IS DISTINCT FROM p_member_id THEN
    RAISE EXCEPTION 'The selected member does not match this loan.';
  END IF;
  IF v_loan.status NOT IN ('disbursed', 'active', 'overdue') THEN
    RAISE EXCEPTION 'Only disbursed loans can receive repayments.';
  END IF;

  v_outstanding := greatest(coalesce(v_loan.outstanding_balance, v_loan.total_repayable, 0), 0);
  IF v_payment > v_outstanding THEN
    RAISE EXCEPTION 'Payment exceeds the outstanding balance of %.', v_outstanding;
  END IF;

  v_remaining := v_payment;
  FOR v_installment IN
    SELECT * FROM public.loan_schedule
    WHERE loan_id = p_loan_id AND amount_paid < total_due
    ORDER BY installment_number
    FOR UPDATE
  LOOP
    v_due_remaining := greatest(v_installment.total_due - v_installment.amount_paid, 0);
    v_applied := least(v_remaining, v_due_remaining);
    IF v_applied <= 0 THEN
      CONTINUE;
    END IF;

    v_new_paid := v_installment.amount_paid + v_applied;
    UPDATE public.loan_schedule
    SET amount_paid = v_new_paid,
        status = CASE WHEN v_new_paid >= total_due THEN 'paid' ELSE 'partial' END,
        paid_date = CASE WHEN v_new_paid >= total_due THEN p_paid_date ELSE paid_date END
    WHERE id = v_installment.id;

    IF v_installment_number IS NULL THEN
      v_installment_number := v_installment.installment_number;
      v_due_date := v_installment.due_date;
    END IF;
    IF v_installment.total_due > 0 THEN
      v_principal_portion := v_principal_portion + round(v_applied * v_installment.principal / v_installment.total_due, 2);
      v_interest_portion := v_interest_portion + round(v_applied * v_installment.interest / v_installment.total_due, 2);
    END IF;
    v_remaining := v_remaining - v_applied;
    EXIT WHEN v_remaining <= 0;
  END LOOP;

  IF v_remaining > 0 THEN
    SELECT * INTO v_last_installment
    FROM public.loan_schedule
    WHERE loan_id = p_loan_id
    ORDER BY installment_number DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'This loan has no repayment schedule.';
    END IF;

    v_new_paid := v_last_installment.amount_paid + v_remaining;
    UPDATE public.loan_schedule
    SET total_due = greatest(total_due, v_new_paid),
        amount_paid = v_new_paid,
        status = 'paid',
        paid_date = p_paid_date
    WHERE id = v_last_installment.id;
    IF v_installment_number IS NULL THEN
      v_installment_number := v_last_installment.installment_number;
      v_due_date := v_last_installment.due_date;
    END IF;
    IF v_last_installment.total_due > 0 THEN
      v_principal_portion := v_principal_portion + round(v_remaining * v_last_installment.principal / v_last_installment.total_due, 2);
      v_interest_portion := v_interest_portion + round(v_remaining * v_last_installment.interest / v_last_installment.total_due, 2);
    END IF;
  END IF;

  v_outstanding_after := greatest(v_outstanding - v_payment, 0);
  INSERT INTO public.loan_repayments (
    repayment_id, loan_id, member_id, amount, principal_portion, interest_portion,
    payment_method, reference, notes, outstanding_after, installment_number,
    due_date, paid_date, status, recorded_by
  ) VALUES (
    p_repayment_id, p_loan_id, p_member_id, v_payment, v_principal_portion,
    v_interest_portion, coalesce(nullif(p_payment_method, ''), 'Cash'),
    coalesce(p_reference, ''), coalesce(p_notes, ''), v_outstanding_after,
    coalesce(v_installment_number, 1), v_due_date, p_paid_date, 'paid',
    coalesce(p_recorded_by, auth.uid())
  ) RETURNING * INTO v_repayment;

  UPDATE public.loan_applications
  SET outstanding_balance = v_outstanding_after,
      status = CASE WHEN v_outstanding_after = 0 THEN 'completed' ELSE status END,
      updated_at = now()
  WHERE id = p_loan_id;

  SELECT staff_id INTO v_staff_id FROM public.members WHERE id = p_member_id;
  IF v_staff_id IS NOT NULL THEN
    UPDATE public.staff
    SET loan_repayment_amount = (
      SELECT coalesce(sum(monthly_repayment), 0)
      FROM public.loan_applications
      WHERE member_id = p_member_id AND status IN ('disbursed', 'active', 'overdue')
    )
    WHERE id = v_staff_id;
  END IF;

  RETURN to_jsonb(v_repayment);
END;
$$;

REVOKE ALL ON FUNCTION public.record_loan_repayment(uuid, uuid, numeric, text, text, text, uuid, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_loan_repayment(uuid, uuid, numeric, text, text, text, uuid, date, text) TO authenticated, service_role;
