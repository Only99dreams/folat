-- Run this in your Supabase SQL Editor to stop the automatic savings cron job
-- This will unschedule the monthly-salary-deductions job if it exists

SELECT cron.unschedule('monthly-salary-deductions');

-- Verify the job is gone (should return 0 rows):
-- SELECT * FROM cron.job WHERE jobname = 'monthly-salary-deductions';
