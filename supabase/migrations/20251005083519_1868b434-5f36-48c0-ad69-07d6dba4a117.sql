-- Update the auto_expire_subscriptions function to also block access
CREATE OR REPLACE FUNCTION public.auto_expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.clients 
  SET 
    subscription_status = 'INACTIVE',
    access_status = false
  WHERE subscription_end_date < CURRENT_DATE 
  AND subscription_status = 'ACTIVE';
END;
$$;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at midnight
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 0 * * *', -- Every day at midnight
  $$
  SELECT public.auto_expire_subscriptions();
  $$
);