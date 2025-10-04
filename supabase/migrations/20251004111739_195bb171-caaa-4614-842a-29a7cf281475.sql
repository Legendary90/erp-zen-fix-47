-- Update employee_attendance table to allow half_day status
ALTER TABLE public.employee_attendance 
DROP CONSTRAINT IF EXISTS employee_attendance_status_check;

ALTER TABLE public.employee_attendance 
ADD CONSTRAINT employee_attendance_status_check 
CHECK (status IN ('present', 'absent', 'leave', 'half_day'));

-- Add unique constraint for employee_id and date to prevent duplicate entries
ALTER TABLE public.employee_attendance 
DROP CONSTRAINT IF EXISTS employee_attendance_unique_employee_date;

ALTER TABLE public.employee_attendance 
ADD CONSTRAINT employee_attendance_unique_employee_date 
UNIQUE (employee_id, date);

-- Add unique constraint for monthly_attendance_summary
ALTER TABLE public.monthly_attendance_summary
DROP CONSTRAINT IF EXISTS monthly_attendance_summary_unique;

ALTER TABLE public.monthly_attendance_summary
ADD CONSTRAINT monthly_attendance_summary_unique
UNIQUE (client_id, employee_id, month_number, year);