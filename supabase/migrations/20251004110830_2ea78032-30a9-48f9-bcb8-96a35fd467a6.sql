-- Drop old trigger if exists
DROP TRIGGER IF EXISTS update_employee_monthly_summary_trigger ON public.daily_attendance;

-- Create trigger function to update monthly summary from employee_attendance
CREATE OR REPLACE FUNCTION public.update_monthly_summary_from_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  month_start DATE;
  month_end DATE;
  total_days_count INTEGER;
  present_count INTEGER;
  absent_count INTEGER;
  leave_count INTEGER;
  half_day_count INTEGER;
BEGIN
  -- Determine the period and month from the attendance record
  month_start := DATE_TRUNC('month', COALESCE(NEW.date, OLD.date));
  month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';
  
  -- Count attendance for the month
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
    COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave,
    COUNT(CASE WHEN status = 'half_day' THEN 1 END) as half_day
  INTO total_days_count, present_count, absent_count, leave_count, half_day_count
  FROM public.employee_attendance 
  WHERE employee_id = COALESCE(NEW.employee_id, OLD.employee_id)
    AND client_id = COALESCE(NEW.client_id, OLD.client_id)
    AND date >= month_start 
    AND date <= month_end;
  
  -- Upsert monthly summary
  INSERT INTO public.monthly_attendance_summary (
    client_id, employee_id, period_id,
    month_number, year,
    total_working_days, present_days, absent_days, leave_days, half_days
  ) VALUES (
    COALESCE(NEW.client_id, OLD.client_id),
    COALESCE(NEW.employee_id, OLD.employee_id),
    COALESCE(NEW.period_id, OLD.period_id),
    EXTRACT(month FROM month_start),
    EXTRACT(year FROM month_start),
    total_days_count, present_count, absent_count, leave_count, half_day_count
  ) ON CONFLICT (client_id, employee_id, month_number, year) 
  DO UPDATE SET 
    total_working_days = EXCLUDED.total_working_days,
    present_days = EXCLUDED.present_days,
    absent_days = EXCLUDED.absent_days,
    leave_days = EXCLUDED.leave_days,
    half_days = EXCLUDED.half_days,
    period_id = EXCLUDED.period_id,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on employee_attendance table
DROP TRIGGER IF EXISTS update_monthly_summary_on_attendance ON public.employee_attendance;
CREATE TRIGGER update_monthly_summary_on_attendance
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_monthly_summary_from_attendance();