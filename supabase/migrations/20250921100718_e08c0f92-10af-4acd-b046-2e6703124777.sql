-- Fix the update_profit_loss function to handle sales_entries properly
CREATE OR REPLACE FUNCTION public.update_profit_loss()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  client_id_val TEXT;
  month_num INTEGER;
  year_num INTEGER;
  total_sales_val DECIMAL(15,2);
  total_expenses_val DECIMAL(15,2);
BEGIN
  -- Get client_id from the record
  IF TG_TABLE_NAME = 'sales_entries' THEN
    client_id_val := COALESCE(NEW.client_id, OLD.client_id);
    month_num := EXTRACT(MONTH FROM COALESCE(NEW.date, OLD.date));
    year_num := EXTRACT(YEAR FROM COALESCE(NEW.date, OLD.date));
  ELSIF TG_TABLE_NAME = 'expense_entries' THEN
    client_id_val := COALESCE(NEW.client_id, OLD.client_id);
    month_num := EXTRACT(MONTH FROM COALESCE(NEW.date, OLD.date));
    year_num := EXTRACT(YEAR FROM COALESCE(NEW.date, OLD.date));
  ELSE
    client_id_val := COALESCE(NEW.client_id, OLD.client_id);
    month_num := COALESCE(NEW.month_number, OLD.month_number);
    year_num := COALESCE(NEW.year, OLD.year);
  END IF;

  -- Calculate total sales for the month
  SELECT COALESCE(SUM(amount), 0) INTO total_sales_val
  FROM public.sales_entries 
  WHERE client_id = client_id_val 
  AND EXTRACT(MONTH FROM date) = month_num 
  AND EXTRACT(YEAR FROM date) = year_num;

  -- Calculate total expenses for the month (from both tables)
  SELECT COALESCE(SUM(me.amount), 0) + COALESCE(SUM(ee.amount), 0) INTO total_expenses_val
  FROM public.monthly_expenses me
  FULL OUTER JOIN public.expense_entries ee ON ee.client_id = me.client_id 
    AND EXTRACT(MONTH FROM ee.date) = me.month_number 
    AND EXTRACT(YEAR FROM ee.date) = me.year
  WHERE COALESCE(me.client_id, ee.client_id) = client_id_val 
  AND COALESCE(me.month_number, EXTRACT(MONTH FROM ee.date)) = month_num 
  AND COALESCE(me.year, EXTRACT(YEAR FROM ee.date)) = year_num;

  -- Upsert profit/loss record
  INSERT INTO public.profit_loss (client_id, month_number, year, total_sales, total_expenses, net_profit_loss)
  VALUES (client_id_val, month_num, year_num, total_sales_val, total_expenses_val, total_sales_val - total_expenses_val)
  ON CONFLICT (client_id, month_number, year) 
  DO UPDATE SET 
    total_sales = EXCLUDED.total_sales,
    total_expenses = EXCLUDED.total_expenses,
    net_profit_loss = EXCLUDED.net_profit_loss,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Now add the example data
-- First, create a default client if not exists
INSERT INTO public.clients (client_id, username, password_hash, company_name, contact_person, email, phone, access_status, subscription_status)
VALUES ('CLI_DEFAULT', 'demo', 'demo123', 'Demo Company Ltd', 'John Demo', 'demo@company.com', '+1-555-0123', true, 'ACTIVE')
ON CONFLICT (client_id) DO NOTHING;

-- Create accounting periods
INSERT INTO public.accounting_periods (client_id, period_name, period_type, start_date, end_date, status) VALUES
('CLI_DEFAULT', 'January 2024', 'monthly', '2024-01-01', '2024-01-31', 'active'),
('CLI_DEFAULT', 'February 2024', 'monthly', '2024-02-01', '2024-02-29', 'closed'),
('CLI_DEFAULT', 'March 2024', 'monthly', '2024-03-01', '2024-03-31', 'active')
ON CONFLICT DO NOTHING;

-- Create customers
INSERT INTO public.customers (client_id, customer_code, customer_name, contact_person, email, phone, address, credit_limit, payment_terms, is_active) VALUES
('CLI_DEFAULT', 'CUST-001', 'ABC Corporation', 'Alice Johnson', 'alice@abccorp.com', '+1-555-1001', '123 Business Ave, New York, NY 10001', 50000.00, 30, true),
('CLI_DEFAULT', 'CUST-002', 'XYZ Industries', 'Bob Smith', 'bob@xyzind.com', '+1-555-1002', '456 Industrial Blvd, Chicago, IL 60601', 75000.00, 45, true),
('CLI_DEFAULT', 'CUST-003', 'Global Solutions Inc', 'Carol Davis', 'carol@globalsol.com', '+1-555-1003', '789 Corporate Dr, Los Angeles, CA 90210', 100000.00, 30, true)
ON CONFLICT DO NOTHING;

-- Create vendors
INSERT INTO public.vendors (client_id, vendor_code, vendor_name, contact_person, email, phone, address, payment_terms, is_active) VALUES
('CLI_DEFAULT', 'VEND-001', 'Office Supplies Co', 'David Wilson', 'david@officesupply.com', '+1-555-2001', '321 Supply St, Austin, TX 78701', 30, true),
('CLI_DEFAULT', 'VEND-002', 'Tech Equipment Ltd', 'Eva Brown', 'eva@techequip.com', '+1-555-2002', '654 Tech Park, Seattle, WA 98101', 45, true),
('CLI_DEFAULT', 'VEND-003', 'Raw Materials Inc', 'Frank Miller', 'frank@rawmat.com', '+1-555-2003', '987 Industrial Way, Detroit, MI 48201', 60, true)
ON CONFLICT DO NOTHING;

-- Create chart of accounts
INSERT INTO public.accounts (client_id, account_code, account_name, account_type, is_active) VALUES
('CLI_DEFAULT', '1000', 'Cash', 'Asset', true),
('CLI_DEFAULT', '1100', 'Accounts Receivable', 'Asset', true),
('CLI_DEFAULT', '1200', 'Inventory', 'Asset', true),
('CLI_DEFAULT', '1500', 'Equipment', 'Asset', true),
('CLI_DEFAULT', '2000', 'Accounts Payable', 'Liability', true),
('CLI_DEFAULT', '2100', 'Accrued Expenses', 'Liability', true),
('CLI_DEFAULT', '3000', 'Capital', 'Equity', true),
('CLI_DEFAULT', '4000', 'Sales Revenue', 'Revenue', true),
('CLI_DEFAULT', '5000', 'Cost of Goods Sold', 'Expense', true),
('CLI_DEFAULT', '6000', 'Operating Expenses', 'Expense', true)
ON CONFLICT DO NOTHING;

-- Create sample sales entries
INSERT INTO public.sales_entries (client_id, description, amount, date, category, payment_status) VALUES
('CLI_DEFAULT', 'Product Sales - ABC Corporation', 15000.00, '2024-01-15', 'Product Sales', 'paid'),
('CLI_DEFAULT', 'Service Revenue - XYZ Industries', 8500.00, '2024-01-20', 'Services', 'paid'),
('CLI_DEFAULT', 'Consulting Services - Global Solutions', 12000.00, '2024-02-10', 'Consulting', 'pending'),
('CLI_DEFAULT', 'Software License Sales', 25000.00, '2024-02-28', 'Software', 'paid'),
('CLI_DEFAULT', 'Maintenance Contract', 5000.00, '2024-03-05', 'Services', 'paid')
ON CONFLICT DO NOTHING;

-- Create sample purchase entries
INSERT INTO public.purchase_entries (client_id, description, amount, date, category, month_number, year) VALUES
('CLI_DEFAULT', 'Office Supplies Purchase', 1200.00, '2024-01-10', 'Office Supplies', 1, 2024),
('CLI_DEFAULT', 'Computer Equipment', 8500.00, '2024-01-25', 'Equipment', 1, 2024),
('CLI_DEFAULT', 'Raw Materials - Batch A', 4500.00, '2024-02-05', 'Raw Materials', 2, 2024),
('CLI_DEFAULT', 'Software Licenses', 3200.00, '2024-02-15', 'Software', 2, 2024),
('CLI_DEFAULT', 'Manufacturing Equipment', 15000.00, '2024-03-01', 'Equipment', 3, 2024)
ON CONFLICT DO NOTHING;

-- Create sample expense entries
INSERT INTO public.expense_entries (client_id, description, amount, date, category) VALUES
('CLI_DEFAULT', 'Office Rent', 3500.00, '2024-01-01', 'Rent'),
('CLI_DEFAULT', 'Utilities - Electric', 450.00, '2024-01-05', 'Utilities'),
('CLI_DEFAULT', 'Employee Salaries', 25000.00, '2024-01-31', 'Payroll'),
('CLI_DEFAULT', 'Marketing Campaign', 2200.00, '2024-02-10', 'Marketing'),
('CLI_DEFAULT', 'Professional Services', 1800.00, '2024-02-20', 'Professional Services'),
('CLI_DEFAULT', 'Travel Expenses', 950.00, '2024-03-02', 'Travel')
ON CONFLICT DO NOTHING;