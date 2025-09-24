-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.get_active_period(p_client_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_period_id uuid;
BEGIN
  SELECT id INTO active_period_id
  FROM public.accounting_periods
  WHERE client_id = p_client_id AND status = 'active'
  LIMIT 1;
  
  RETURN active_period_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_period_editable(p_period_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  period_status text;
BEGIN
  SELECT status INTO period_status
  FROM public.accounting_periods
  WHERE id = p_period_id;
  
  RETURN COALESCE(period_status = 'active', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_attendance_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_period_id uuid;
BEGIN
  -- Get the active period for the client
  SELECT public.get_active_period(NEW.client_id) INTO active_period_id;
  
  -- Set the period_id
  NEW.period_id := active_period_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_id_for_user()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.clients WHERE user_id = auth.uid() LIMIT 1;
$$;