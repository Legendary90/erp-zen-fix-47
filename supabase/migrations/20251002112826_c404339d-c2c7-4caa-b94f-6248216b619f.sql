-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS update_employee_monthly_summary_trigger ON public.employee_attendance;

-- Create fiscal years table
CREATE TABLE IF NOT EXISTS public.fiscal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  year_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, year_name)
);

-- Update accounting_periods to reference fiscal years
ALTER TABLE public.accounting_periods 
ADD COLUMN IF NOT EXISTS fiscal_year_id UUID REFERENCES public.fiscal_years(id) ON DELETE CASCADE;

-- Delete rows with null period_id if no active period exists
DELETE FROM public.employee_attendance
WHERE period_id IS NULL 
AND NOT EXISTS (
  SELECT 1 FROM public.accounting_periods 
  WHERE client_id = employee_attendance.client_id 
  AND status = 'active'
);

-- Fix remaining null period_id values
UPDATE public.employee_attendance
SET period_id = (
  SELECT id FROM public.accounting_periods 
  WHERE client_id = employee_attendance.client_id 
  ORDER BY created_at DESC
  LIMIT 1
)
WHERE period_id IS NULL;

-- Now we can safely set NOT NULL constraint
ALTER TABLE public.employee_attendance 
ALTER COLUMN period_id SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fiscal_years_client ON public.fiscal_years(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_fiscal_year ON public.accounting_periods(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_employee_attendance_period ON public.employee_attendance(period_id);

-- Enable RLS on fiscal_years
ALTER TABLE public.fiscal_years ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fiscal_years
CREATE POLICY "Users can manage own fiscal years"
ON public.fiscal_years
FOR ALL
USING (client_id = get_client_id_for_user());

CREATE POLICY "Allow legacy system access to fiscal years"
ON public.fiscal_years
FOR ALL
USING (true)
WITH CHECK (true);

-- Update trigger for fiscal_years
CREATE TRIGGER update_fiscal_years_updated_at
BEFORE UPDATE ON public.fiscal_years
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get active fiscal year
CREATE OR REPLACE FUNCTION public.get_active_fiscal_year(p_client_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_id UUID;
BEGIN
  SELECT id INTO year_id
  FROM public.fiscal_years
  WHERE client_id = p_client_id AND status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;
  
  RETURN year_id;
END;
$$;

-- Update set_attendance_period function
CREATE OR REPLACE FUNCTION public.set_attendance_period()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_period_id UUID;
  fiscal_year_id UUID;
BEGIN
  -- Get active fiscal year
  SELECT public.get_active_fiscal_year(NEW.client_id) INTO fiscal_year_id;
  
  -- Get the active period for the client within the fiscal year
  SELECT id INTO active_period_id
  FROM public.accounting_periods
  WHERE client_id = NEW.client_id 
    AND status = 'active'
    AND (fiscal_year_id IS NULL OR accounting_periods.fiscal_year_id = fiscal_year_id)
  ORDER BY start_date DESC
  LIMIT 1;
  
  IF active_period_id IS NULL THEN
    RAISE EXCEPTION 'No active period found. Please create an active period first.';
  END IF;
  
  -- Set the period_id
  NEW.period_id := active_period_id;
  
  RETURN NEW;
END;
$$;

-- Add trigger to employee_attendance
DROP TRIGGER IF EXISTS set_employee_attendance_period ON public.employee_attendance;
CREATE TRIGGER set_employee_attendance_period
BEFORE INSERT ON public.employee_attendance
FOR EACH ROW
EXECUTE FUNCTION public.set_attendance_period();