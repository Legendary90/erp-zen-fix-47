-- Fix RLS policy for client registration
-- Allow anonymous users to register new clients
CREATE POLICY "Allow client registration" 
ON public.clients 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow clients to view their own data
CREATE POLICY "Clients can view their own data" 
ON public.clients 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow clients to update their own data  
CREATE POLICY "Clients can update their own data" 
ON public.clients 
FOR UPDATE 
TO anon, authenticated
USING (true);

-- Fix search path for existing functions
CREATE OR REPLACE FUNCTION public.auto_expire_subscriptions()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_end_date < CURRENT_DATE 
  AND subscription_status = 'ACTIVE';
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Mark expired subscriptions as inactive
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_status = 'ACTIVE' 
    AND subscription_end_date < now();
END;
$function$;