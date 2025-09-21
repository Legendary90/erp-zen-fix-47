-- Create example data for all ERP features

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

-- Create sample challans
INSERT INTO public.challans (client_id, challan_number, date, sender_name, sender_address, receiver_name, receiver_address, goods_description, quantity, weight, units, truck_number, driver_name, courier_service, batch_number) VALUES
('CLI_DEFAULT', 'CH-001-2024', '2024-01-15', 'Demo Company Ltd', '123 Demo St, Demo City', 'ABC Corporation', '123 Business Ave, New York, NY', 'Electronic Components', '100', '50kg', 'pieces', 'TRK-001', 'Mike Driver', 'FastShip Express', 'BATCH-001'),
('CLI_DEFAULT', 'CH-002-2024', '2024-02-20', 'Demo Company Ltd', '123 Demo St, Demo City', 'XYZ Industries', '456 Industrial Blvd, Chicago, IL', 'Software Products', '25', '5kg', 'boxes', 'TRK-002', 'Sarah Transport', 'QuickDelivery', 'BATCH-002')
ON CONFLICT DO NOTHING;

-- Create sample documents
INSERT INTO public.documents (client_id, type, document_data) VALUES
('CLI_DEFAULT', 'invoice', '{"invoice_number": "INV-001", "customer": "ABC Corporation", "amount": 15000, "date": "2024-01-15"}'),
('CLI_DEFAULT', 'balance_sheet', '{"assets": 150000, "liabilities": 75000, "equity": 75000, "date": "2024-03-31"}')
ON CONFLICT DO NOTHING;