-- Create comprehensive test client setup function
CREATE OR REPLACE FUNCTION public.create_test_client_complete()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  test_client_id TEXT;
  period_id UUID;
  employee1_id UUID;
  employee2_id UUID;
BEGIN
  -- Generate test client ID
  test_client_id := 'TEST_' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- Create test client with proper subscription
  INSERT INTO public.clients (
    client_id,
    username,
    company_name,
    email,
    password_hash,
    access_status,
    subscription_status,
    subscription_start_date,
    subscription_end_date,
    subscription_day,
    subscription_billing_day
  ) VALUES (
    test_client_id,
    'testclient',
    'Test Company Ltd',
    'test@company.com',
    'testpass123',
    true,
    'ACTIVE',
    CURRENT_DATE,
    calculate_subscription_end_date(CURRENT_DATE, 1),
    EXTRACT(day FROM CURRENT_DATE),
    EXTRACT(day FROM CURRENT_DATE)
  );
  
  -- Create default accounting period
  INSERT INTO public.accounting_periods (
    client_id,
    period_name,
    period_type,
    start_date,
    end_date,
    status
  ) VALUES (
    test_client_id,
    TO_CHAR(CURRENT_DATE, 'Month YYYY'),
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    'active'
  ) RETURNING id INTO period_id;
  
  -- Create test employees
  INSERT INTO public.employees (
    client_id,
    employee_code,
    name,
    position,
    email,
    phone,
    status,
    department,
    hire_date,
    salary
  ) VALUES 
  (
    test_client_id,
    'EMP001',
    'John Doe',
    'Software Developer',
    'john.doe@testcompany.com',
    '+1234567890',
    'active',
    'IT',
    CURRENT_DATE - INTERVAL '30 days',
    75000
  ),
  (
    test_client_id,
    'EMP002',
    'Jane Smith',
    'Project Manager',
    'jane.smith@testcompany.com',
    '+1234567891',
    'active',
    'Management',
    CURRENT_DATE - INTERVAL '60 days',
    85000
  ) RETURNING id INTO employee1_id, employee2_id;
  
  -- Get employee IDs for attendance records
  SELECT id INTO employee1_id FROM public.employees 
  WHERE client_id = test_client_id AND employee_code = 'EMP001';
  
  SELECT id INTO employee2_id FROM public.employees 
  WHERE client_id = test_client_id AND employee_code = 'EMP002';
  
  -- Create sample attendance records for the current month
  INSERT INTO public.attendance_tracking (
    client_id,
    employee_id,
    attendance_date,
    status,
    period_id
  ) 
  SELECT 
    test_client_id,
    emp_id,
    generate_series(
      DATE_TRUNC('month', CURRENT_DATE),
      CURRENT_DATE - INTERVAL '1 day',
      '1 day'::interval
    )::date,
    CASE 
      WHEN EXTRACT(dow FROM generate_series(
        DATE_TRUNC('month', CURRENT_DATE),
        CURRENT_DATE - INTERVAL '1 day',
        '1 day'::interval
      )) IN (0, 6) THEN 'leave'  -- Weekends as leave
      WHEN random() < 0.05 THEN 'absent'  -- 5% chance of absence
      WHEN random() < 0.1 THEN 'half_day'  -- 10% chance of half day
      ELSE 'present'
    END,
    period_id
  FROM (VALUES (employee1_id), (employee2_id)) AS t(emp_id);
  
  -- Create sample sales entries
  INSERT INTO public.sales_entries (
    client_id,
    description,
    amount,
    category,
    date,
    period_id,
    payment_status
  ) VALUES 
  (test_client_id, 'Software Development Services', 15000.00, 'Services', CURRENT_DATE - INTERVAL '5 days', period_id, 'paid'),
  (test_client_id, 'Consulting Services', 8500.00, 'Consulting', CURRENT_DATE - INTERVAL '10 days', period_id, 'paid'),
  (test_client_id, 'Project Management', 12000.00, 'Services', CURRENT_DATE - INTERVAL '15 days', period_id, 'pending');
  
  -- Create sample expense entries
  INSERT INTO public.expense_entries (
    client_id,
    description,
    amount,
    category,
    date,
    period_id
  ) VALUES 
  (test_client_id, 'Office Rent', 3000.00, 'Rent', CURRENT_DATE - INTERVAL '3 days', period_id),
  (test_client_id, 'Software Licenses', 1200.00, 'Software', CURRENT_DATE - INTERVAL '7 days', period_id),
  (test_client_id, 'Employee Training', 800.00, 'Training', CURRENT_DATE - INTERVAL '12 days', period_id);
  
  -- Create monthly attendance summary
  INSERT INTO public.monthly_attendance_summary (
    client_id,
    employee_id,
    month_number,
    year,
    total_working_days,
    present_days,
    absent_days,
    leave_days,
    half_days,
    period_id
  )
  SELECT 
    test_client_id,
    e.id,
    EXTRACT(month FROM CURRENT_DATE),
    EXTRACT(year FROM CURRENT_DATE),
    COUNT(*) as total_working_days,
    COUNT(CASE WHEN at.status = 'present' THEN 1 END) as present_days,
    COUNT(CASE WHEN at.status = 'absent' THEN 1 END) as absent_days,
    COUNT(CASE WHEN at.status = 'leave' THEN 1 END) as leave_days,
    COUNT(CASE WHEN at.status = 'half_day' THEN 1 END) as half_days,
    period_id
  FROM public.employees e
  LEFT JOIN public.attendance_tracking at ON e.id = at.employee_id
  WHERE e.client_id = test_client_id
  GROUP BY e.id;
  
  RETURN test_client_id;
END;
$$;