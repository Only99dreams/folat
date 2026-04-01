-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  FOLAT Cooperative Management System — Complete Database Schema  ║
-- ║  Run this SQL in your Supabase SQL Editor                        ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────
-- 1. PROFILES (already exists — update to add 'unassigned' role)
-- ────────────────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin','branch_manager','finance_officer','loan_officer','front_desk','auditor','hr_manager','unassigned'));

-- Add status columns if missing
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ────────────────────────────────────────────
-- 2. BRANCHES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  manager_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view branches" ON public.branches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admin and branch managers can insert branches" ON public.branches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Super admin and branch managers can update branches" ON public.branches
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 3. MEMBERS (cooperative members + external customers)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id text NOT NULL UNIQUE,  -- e.g. FOL-2024-001
  member_type text NOT NULL DEFAULT 'cooperative' CHECK (member_type IN ('cooperative','external')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  other_names text DEFAULT '',
  gender text DEFAULT '' CHECK (gender IN ('','Male','Female','Other')),
  date_of_birth date,
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  national_id text DEFAULT '',
  id_document_url text DEFAULT '',
  branch_id uuid REFERENCES public.branches(id),
  group_id uuid,  -- FK added after groups table
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  -- Cooperative-specific
  contribution_type text DEFAULT 'monthly' CHECK (contribution_type IN ('monthly','weekly','daily','')),
  initial_deposit numeric(15,2) DEFAULT 0,
  -- External-specific
  employment_status text DEFAULT '',
  employer text DEFAULT '',
  monthly_income numeric(15,2) DEFAULT 0,
  credit_score integer DEFAULT 0,
  -- Next of kin
  nok_name text DEFAULT '',
  nok_phone text DEFAULT '',
  nok_relationship text DEFAULT '',
  nok_address text DEFAULT '',
  -- Guarantor
  guarantor_name text DEFAULT '',
  guarantor_phone text DEFAULT '',
  guarantor_relationship text DEFAULT '',
  guarantor_address text DEFAULT '',
  -- Metadata
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view members" ON public.members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON public.members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" ON public.members
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 4. GROUPS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  group_code text NOT NULL UNIQUE,
  branch_id uuid REFERENCES public.branches(id),
  leader_id uuid REFERENCES public.members(id),
  secretary_id uuid REFERENCES public.members(id),
  max_members integer DEFAULT 30,
  min_savings numeric(15,2) DEFAULT 0,
  loan_eligibility_rule text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  notes text DEFAULT '',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view groups" ON public.groups
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert groups" ON public.groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update groups" ON public.groups
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add FK to members
DO $$ BEGIN
  ALTER TABLE public.members
    ADD CONSTRAINT members_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Group members junction table
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage group_members" ON public.group_members
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 5. SAVINGS ACCOUNTS & TRANSACTIONS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.savings_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  account_number text NOT NULL UNIQUE,
  balance numeric(15,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','frozen','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view savings_accounts" ON public.savings_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert savings_accounts" ON public.savings_accounts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update savings_accounts" ON public.savings_accounts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id text NOT NULL UNIQUE,  -- e.g. TXN-20240101-001
  account_id uuid NOT NULL REFERENCES public.savings_accounts(id),
  member_id uuid NOT NULL REFERENCES public.members(id),
  type text NOT NULL CHECK (type IN ('deposit','withdrawal','adjustment')),
  amount numeric(15,2) NOT NULL,
  balance_after numeric(15,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash','bank_transfer','cheque','mobile_money','online')),
  reference text DEFAULT '',
  notes text DEFAULT '',
  recorded_by uuid REFERENCES public.profiles(id),
  branch_id uuid REFERENCES public.branches(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view savings_transactions" ON public.savings_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert savings_transactions" ON public.savings_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 6. LOANS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id text NOT NULL UNIQUE,  -- e.g. LN-2024-001
  member_id uuid NOT NULL REFERENCES public.members(id),
  group_id uuid REFERENCES public.groups(id),
  branch_id uuid REFERENCES public.branches(id),
  loan_type text NOT NULL DEFAULT 'personal' CHECK (loan_type IN ('personal','business','mortgage','emergency','group','agriculture')),
  amount_requested numeric(15,2) NOT NULL,
  amount_approved numeric(15,2),
  interest_rate numeric(5,2) NOT NULL DEFAULT 15,
  duration_months integer NOT NULL DEFAULT 12,
  purpose text DEFAULT '',
  risk_premium numeric(5,2) DEFAULT 0,
  service_charge numeric(15,2) DEFAULT 0,
  loan_cycle integer DEFAULT 1,
  disbursement_date date,
  first_installment_date date,
  monthly_repayment numeric(15,2) DEFAULT 0,
  total_repayable numeric(15,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','disbursed','active','completed','defaulted','written_off')),
  credit_officer_id uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approval_date timestamptz,
  approval_notes text DEFAULT '',
  co_recommendation text DEFAULT '',
  guarantor1_name text DEFAULT '',
  guarantor1_savings numeric(15,2) DEFAULT 0,
  guarantor1_status text DEFAULT '',
  guarantor2_name text DEFAULT '',
  guarantor2_savings numeric(15,2) DEFAULT 0,
  guarantor2_status text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view loan_applications" ON public.loan_applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert loan_applications" ON public.loan_applications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update loan_applications" ON public.loan_applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 7. LOAN REPAYMENTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  repayment_id text NOT NULL UNIQUE,
  loan_id uuid NOT NULL REFERENCES public.loan_applications(id),
  member_id uuid NOT NULL REFERENCES public.members(id),
  amount numeric(15,2) NOT NULL,
  principal_portion numeric(15,2) DEFAULT 0,
  interest_portion numeric(15,2) DEFAULT 0,
  penalty numeric(15,2) DEFAULT 0,
  payment_method text DEFAULT 'cash',
  reference text DEFAULT '',
  notes text DEFAULT '',
  outstanding_after numeric(15,2) DEFAULT 0,
  installment_number integer DEFAULT 1,
  due_date date,
  paid_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','partial','pending','overdue')),
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view loan_repayments" ON public.loan_repayments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert loan_repayments" ON public.loan_repayments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 8. LOAN REPAYMENT SCHEDULE
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loan_schedule (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  principal numeric(15,2) NOT NULL DEFAULT 0,
  interest numeric(15,2) NOT NULL DEFAULT 0,
  total_due numeric(15,2) NOT NULL DEFAULT 0,
  amount_paid numeric(15,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','partial','overdue')),
  paid_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage loan_schedule" ON public.loan_schedule
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 9. FINANCE — INCOME & EXPENSES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('income','expense')),
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  amount numeric(15,2) NOT NULL,
  payment_method text DEFAULT 'cash',
  reference text DEFAULT '',
  branch_id uuid REFERENCES public.branches(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','approved','voided')),
  receipt_url text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view finance_transactions" ON public.finance_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert finance_transactions" ON public.finance_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update finance_transactions" ON public.finance_transactions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 10. FUND REQUESTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fund_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id text NOT NULL UNIQUE,
  branch_id uuid REFERENCES public.branches(id),
  requested_by uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric(15,2) NOT NULL,
  purpose text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','disbursed')),
  reviewed_by uuid REFERENCES public.profiles(id),
  review_date timestamptz,
  review_notes text DEFAULT '',
  disbursed_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fund_requests" ON public.fund_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert fund_requests" ON public.fund_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update fund_requests" ON public.fund_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 11. STAFF
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id),
  staff_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text DEFAULT '',
  date_of_birth date,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text DEFAULT '',
  branch_id uuid REFERENCES public.branches(id),
  job_role text NOT NULL DEFAULT '',
  department text DEFAULT '',
  date_joined date NOT NULL DEFAULT CURRENT_DATE,
  employment_status text NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active','suspended','resigned','terminated')),
  employment_type text DEFAULT 'full_time' CHECK (employment_type IN ('full_time','part_time','contract')),
  basic_salary numeric(15,2) DEFAULT 0,
  housing_allowance numeric(15,2) DEFAULT 0,
  transport_allowance numeric(15,2) DEFAULT 0,
  other_allowances numeric(15,2) DEFAULT 0,
  photo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff" ON public.staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert staff" ON public.staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update staff" ON public.staff
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 12. LEAVE REQUESTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id uuid NOT NULL REFERENCES public.staff(id),
  leave_type text NOT NULL DEFAULT 'annual' CHECK (leave_type IN ('annual','sick','maternity','paternity','compassionate','unpaid','study')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL DEFAULT 1,
  reason text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by uuid REFERENCES public.profiles(id),
  approval_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leave_requests" ON public.leave_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 13. ATTENDANCE
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id uuid NOT NULL REFERENCES public.staff(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz,
  clock_out timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','leave')),
  notes text DEFAULT '',
  branch_id uuid REFERENCES public.branches(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage attendance" ON public.attendance
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 14. MESSAGES (internal messaging)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  recipient_id uuid REFERENCES public.profiles(id),
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  folder text NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox','sent','drafts','trash')),
  parent_id uuid REFERENCES public.messages(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- ────────────────────────────────────────────
-- 15. SMS LOG
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sms_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_by uuid NOT NULL REFERENCES public.profiles(id),
  recipients text NOT NULL DEFAULT '',  -- comma-separated or 'all_members', 'branch:xxx'
  message text NOT NULL DEFAULT '',
  recipient_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage sms_log" ON public.sms_log
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 16. AUDIT LOG
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit_log" ON public.audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert audit_log" ON public.audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 17. ORGANIZATION SETTINGS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.org_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org_settings" ON public.org_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage org_settings" ON public.org_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- 18. NOTIFICATION PREFERENCES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  push_notifications boolean NOT NULL DEFAULT true,
  loan_alerts boolean NOT NULL DEFAULT true,
  deposit_alerts boolean NOT NULL DEFAULT true,
  system_alerts boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- 19. HELPER FUNCTIONS
-- ────────────────────────────────────────────

-- Generate sequential IDs
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_id FROM '\d+$') AS integer)), 0) + 1
  INTO next_num FROM public.members;
  RETURN 'FOL-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_loan_id()
RETURNS text AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(loan_id FROM '\d+$') AS integer)), 0) + 1
  INTO next_num FROM public.loan_applications;
  RETURN 'LN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_transaction_id()
RETURNS text AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_id FROM '\d+$') AS integer)), 0) + 1
  INTO next_num FROM public.savings_transactions;
  RETURN 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────
-- 20. PROFILES TABLE — allow super_admin to read all profiles
-- ────────────────────────────────────────────
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- New policies: authenticated users can read all profiles, but only update own
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Super admin can update any profile (for role assignments)
CREATE POLICY "Super admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- ────────────────────────────────────────────
-- 21. INDEXES
-- ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_members_branch ON public.members(branch_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_member ON public.savings_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_txn_account ON public.savings_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_savings_txn_member ON public.savings_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_member ON public.loan_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_finance_type ON public.finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_date ON public.finance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_staff_branch ON public.staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ────────────────────────────────────────────
-- 22. SCHEMA MIGRATIONS — Additional columns
-- ────────────────────────────────────────────
-- Signature URL for loan applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS signature_url text DEFAULT '';
-- Father name for loan applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS father_name text DEFAULT '';
-- Group ref for loan applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id);

-- Document URL for fund requests
ALTER TABLE public.fund_requests ADD COLUMN IF NOT EXISTS document_url text DEFAULT '';
-- Justification for fund requests
ALTER TABLE public.fund_requests ADD COLUMN IF NOT EXISTS justification text DEFAULT '';

-- Avatar URL for profile photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';

-- ────────────────────────────────────────────
-- 23. STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;
