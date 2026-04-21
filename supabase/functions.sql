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
