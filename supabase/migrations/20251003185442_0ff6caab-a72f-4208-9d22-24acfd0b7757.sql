-- Fix ambiguous fiscal_year_id reference in set_attendance_period function
DROP FUNCTION IF EXISTS public.set_attendance_period() CASCADE;

CREATE OR REPLACE FUNCTION public.set_attendance_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_period_id UUID;
  active_fiscal_year_id UUID;
BEGIN
  -- Get active fiscal year
  SELECT public.get_active_fiscal_year(NEW.client_id) INTO active_fiscal_year_id;
  
  -- Get the active period for the client within the fiscal year
  SELECT ap.id INTO active_period_id
  FROM public.accounting_periods ap
  WHERE ap.client_id = NEW.client_id 
    AND ap.status = 'active'
    AND (ap.fiscal_year_id IS NULL OR ap.fiscal_year_id = active_fiscal_year_id)
  ORDER BY ap.start_date DESC
  LIMIT 1;
  
  IF active_period_id IS NULL THEN
    RAISE EXCEPTION 'No active period found. Please create an active period first.';
  END IF;
  
  -- Set the period_id
  NEW.period_id := active_period_id;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger for employee_attendance
DROP TRIGGER IF EXISTS set_employee_attendance_period ON public.employee_attendance;
CREATE TRIGGER set_employee_attendance_period
  BEFORE INSERT ON public.employee_attendance
  FOR EACH ROW
  WHEN (NEW.period_id IS NULL)
  EXECUTE FUNCTION public.set_attendance_period();