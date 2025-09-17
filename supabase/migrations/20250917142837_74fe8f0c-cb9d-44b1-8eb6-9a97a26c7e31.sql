-- Add subscription management and data persistence
-- Update clients table for better subscription tracking
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_data_backup TIMESTAMP WITH TIME ZONE;

-- Create data persistence function that preserves client data during subscription changes
CREATE OR REPLACE FUNCTION preserve_client_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Always preserve data regardless of subscription status changes
  -- Only update subscription tracking fields
  NEW.last_data_backup = OLD.last_data_backup;
  
  -- If subscription is being activated, set start date
  IF OLD.subscription_status = 'INACTIVE' AND NEW.subscription_status = 'ACTIVE' THEN
    NEW.subscription_start_date = now();
    NEW.subscription_end_date = now() + INTERVAL '1 month';
  END IF;
  
  -- If subscription is being deactivated, keep end date but don't delete data
  IF OLD.subscription_status = 'ACTIVE' AND NEW.subscription_status = 'INACTIVE' THEN
    NEW.subscription_end_date = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to preserve data during subscription changes
DROP TRIGGER IF EXISTS preserve_client_data_trigger ON public.clients;
CREATE TRIGGER preserve_client_data_trigger
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION preserve_client_data();

-- Create function to check subscription expiry (for admin panel automation)
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Mark expired subscriptions as inactive
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_status = 'ACTIVE' 
    AND subscription_end_date < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to extend subscription (for admin panel)
CREATE OR REPLACE FUNCTION extend_client_subscription(
  p_client_id TEXT,
  p_months INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  client_exists BOOLEAN;
BEGIN
  -- Check if client exists
  SELECT EXISTS(SELECT 1 FROM public.clients WHERE client_id = p_client_id) INTO client_exists;
  
  IF NOT client_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Extend subscription
  UPDATE public.clients 
  SET 
    subscription_status = 'ACTIVE',
    subscription_start_date = CASE 
      WHEN subscription_status = 'INACTIVE' THEN now()
      ELSE subscription_start_date 
    END,
    subscription_end_date = CASE 
      WHEN subscription_status = 'INACTIVE' THEN now() + (p_months || ' months')::INTERVAL
      ELSE subscription_end_date + (p_months || ' months')::INTERVAL 
    END,
    access_status = true
  WHERE client_id = p_client_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;