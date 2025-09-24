-- Add period_id to employees table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'employees' 
                   AND column_name = 'period_id') THEN
        ALTER TABLE public.employees ADD COLUMN period_id uuid REFERENCES public.accounting_periods(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add period_id to employee_attendance table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'employee_attendance' 
                   AND column_name = 'period_id') THEN
        ALTER TABLE public.employee_attendance ADD COLUMN period_id uuid REFERENCES public.accounting_periods(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create function to get current active period
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

-- Create function to check if period is editable
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

-- Update attendance trigger to auto-set period_id
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

-- Create trigger for attendance period assignment
DROP TRIGGER IF EXISTS set_attendance_period_trigger ON public.employee_attendance;
CREATE TRIGGER set_attendance_period_trigger
  BEFORE INSERT ON public.employee_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_attendance_period();

-- Create secure client lookup function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_client_id_for_user()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.clients WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop and recreate RLS policies to fix recursion issues
DROP POLICY IF EXISTS "Users can manage own employees" ON public.employees;
CREATE POLICY "Users can manage own employees"
ON public.employees
FOR ALL
USING (client_id = public.get_client_id_for_user());

DROP POLICY IF EXISTS "Users can manage own employee attendance" ON public.employee_attendance;
CREATE POLICY "Users can manage own employee attendance"
ON public.employee_attendance
FOR ALL
USING (client_id = public.get_client_id_for_user());

DROP POLICY IF EXISTS "Users can manage own accounting periods" ON public.accounting_periods;
CREATE POLICY "Users can manage own accounting periods"
ON public.accounting_periods
FOR ALL
USING (client_id = public.get_client_id_for_user());

-- Create RLS policies to prevent editing closed periods
DROP POLICY IF EXISTS "Cannot edit attendance for closed periods" ON public.employee_attendance;
CREATE POLICY "Cannot edit attendance for closed periods"
ON public.employee_attendance
FOR UPDATE
USING (public.is_period_editable(period_id));

DROP POLICY IF EXISTS "Cannot delete attendance for closed periods" ON public.employee_attendance;
CREATE POLICY "Cannot delete attendance for closed periods" 
ON public.employee_attendance
FOR DELETE
USING (public.is_period_editable(period_id));

-- Update existing attendance records with current active period
UPDATE public.employee_attendance 
SET period_id = public.get_active_period(client_id)
WHERE period_id IS NULL;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_active_period(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_period_editable(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_id_for_user() TO authenticated;