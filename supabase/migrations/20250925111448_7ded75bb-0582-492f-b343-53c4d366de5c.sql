-- Fix subscription system with day-based billing
-- Update clients table to support day-based subscriptions
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS subscription_billing_day INTEGER DEFAULT EXTRACT(day FROM CURRENT_DATE);

-- Create function to calculate next billing date based on billing day
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(
  start_date DATE,
  billing_day INTEGER
) RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_month DATE;
  days_in_month INTEGER;
  next_billing_date DATE;
BEGIN
  -- Move to next month
  target_month := DATE_TRUNC('month', start_date) + INTERVAL '1 month';
  
  -- Get days in target month
  days_in_month := EXTRACT(day FROM (target_month + INTERVAL '1 month' - INTERVAL '1 day'));
  
  -- If billing day is greater than days in month, use last day of month
  IF billing_day > days_in_month THEN
    next_billing_date := target_month + (days_in_month - 1) * INTERVAL '1 day';
  ELSE
    next_billing_date := target_month + (billing_day - 1) * INTERVAL '1 day';
  END IF;
  
  RETURN next_billing_date;
END;
$$;

-- Create comprehensive attendance system
CREATE TABLE IF NOT EXISTS public.attendance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'half_day')),
  period_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- Enable RLS for attendance tracking
ALTER TABLE public.attendance_tracking ENABLE ROW LEVEL SECURITY;

-- Create monthly attendance summary table
CREATE TABLE IF NOT EXISTS public.monthly_attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  month_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  period_id UUID,
  total_working_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  leave_days INTEGER DEFAULT 0,
  half_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, month_number, year)
);

-- Enable RLS for monthly summary
ALTER TABLE public.monthly_attendance_summary ENABLE ROW LEVEL SECURITY;

-- Fix all RLS policies
DROP POLICY IF EXISTS "Users can manage own attendance tracking" ON public.attendance_tracking;
CREATE POLICY "Users can manage own attendance tracking" ON public.attendance_tracking
  FOR ALL USING (client_id = get_client_id_for_user());

DROP POLICY IF EXISTS "Allow legacy system access to attendance tracking" ON public.attendance_tracking;
CREATE POLICY "Allow legacy system access to attendance tracking" ON public.attendance_tracking
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own monthly summaries" ON public.monthly_attendance_summary;
CREATE POLICY "Users can manage own monthly summaries" ON public.monthly_attendance_summary
  FOR ALL USING (client_id = get_client_id_for_user());

DROP POLICY IF EXISTS "Allow legacy system access to monthly summaries" ON public.monthly_attendance_summary;
CREATE POLICY "Allow legacy system access to monthly summaries" ON public.monthly_attendance_summary
  FOR ALL USING (true) WITH CHECK (true);