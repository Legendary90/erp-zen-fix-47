-- Fix RLS policies to allow legacy system access
-- Update employees table
DROP POLICY IF EXISTS "Allow legacy system access to employees" ON public.employees;
CREATE POLICY "Allow legacy system access to employees" ON public.employees
FOR ALL USING (true) WITH CHECK (true);

-- Update sales_entries table  
DROP POLICY IF EXISTS "Allow legacy system access to sales entries" ON public.sales_entries;
CREATE POLICY "Allow legacy system access to sales entries" ON public.sales_entries
FOR ALL USING (true) WITH CHECK (true);

-- Update expense_entries table
DROP POLICY IF EXISTS "Allow legacy system access to expense entries" ON public.expense_entries;
CREATE POLICY "Allow legacy system access to expense entries" ON public.expense_entries
FOR ALL USING (true) WITH CHECK (true);

-- Update customers table
DROP POLICY IF EXISTS "Allow legacy system access to customers" ON public.customers;
CREATE POLICY "Allow legacy system access to customers" ON public.customers
FOR ALL USING (true) WITH CHECK (true);

-- Update employee_attendance table
DROP POLICY IF EXISTS "Allow legacy system access to employee attendance" ON public.employee_attendance;
CREATE POLICY "Allow legacy system access to employee attendance" ON public.employee_attendance
FOR ALL USING (true) WITH CHECK (true);

-- Update accounting_periods table
DROP POLICY IF EXISTS "Allow legacy system access to accounting periods" ON public.accounting_periods;
CREATE POLICY "Allow legacy system access to accounting periods" ON public.accounting_periods
FOR ALL USING (true) WITH CHECK (true);

-- Update vendors table
DROP POLICY IF EXISTS "Allow legacy system access to vendors" ON public.vendors;
CREATE POLICY "Allow legacy system access to vendors" ON public.vendors
FOR ALL USING (true) WITH CHECK (true);

-- Update purchase_entries table
DROP POLICY IF EXISTS "Allow legacy system access to purchase entries" ON public.purchase_entries;
CREATE POLICY "Allow legacy system access to purchase entries" ON public.purchase_entries
FOR ALL USING (true) WITH CHECK (true);

-- Update monthly_attendance_summary table
DROP POLICY IF EXISTS "Allow legacy system access to monthly summaries" ON public.monthly_attendance_summary;
CREATE POLICY "Allow legacy system access to monthly summaries" ON public.monthly_attendance_summary
FOR ALL USING (true) WITH CHECK (true);

-- Update general_ledger table
DROP POLICY IF EXISTS "Allow legacy system access to general ledger" ON public.general_ledger;
CREATE POLICY "Allow legacy system access to general ledger" ON public.general_ledger
FOR ALL USING (true) WITH CHECK (true);

-- Update accounts table
DROP POLICY IF EXISTS "Allow legacy system access to accounts" ON public.accounts;
CREATE POLICY "Allow legacy system access to accounts" ON public.accounts
FOR ALL USING (true) WITH CHECK (true);

-- Update invoices table
DROP POLICY IF EXISTS "Allow legacy system access to invoices" ON public.invoices;
CREATE POLICY "Allow legacy system access to invoices" ON public.invoices
FOR ALL USING (true) WITH CHECK (true);

-- Update bills table
DROP POLICY IF EXISTS "Allow legacy system access to bills" ON public.bills;
CREATE POLICY "Allow legacy system access to bills" ON public.bills
FOR ALL USING (true) WITH CHECK (true);

-- Update challans table
DROP POLICY IF EXISTS "Allow legacy system access to challans" ON public.challans;
CREATE POLICY "Allow legacy system access to challans" ON public.challans
FOR ALL USING (true) WITH CHECK (true);

-- Update documents table
DROP POLICY IF EXISTS "Allow legacy system access to documents" ON public.documents;
CREATE POLICY "Allow legacy system access to documents" ON public.documents
FOR ALL USING (true) WITH CHECK (true);

-- Update legal_documents table
DROP POLICY IF EXISTS "Allow legacy system access to legal documents" ON public.legal_documents;
CREATE POLICY "Allow legacy system access to legal documents" ON public.legal_documents
FOR ALL USING (true) WITH CHECK (true);

-- Update customer_relations table
DROP POLICY IF EXISTS "Allow legacy system access to customer relations" ON public.customer_relations;
CREATE POLICY "Allow legacy system access to customer relations" ON public.customer_relations
FOR ALL USING (true) WITH CHECK (true);

-- Update monthly_expenses table
DROP POLICY IF EXISTS "Allow legacy system access to monthly expenses" ON public.monthly_expenses;
CREATE POLICY "Allow legacy system access to monthly expenses" ON public.monthly_expenses
FOR ALL USING (true) WITH CHECK (true);

-- Update profit_loss table
DROP POLICY IF EXISTS "Allow legacy system access to profit loss" ON public.profit_loss;
CREATE POLICY "Allow legacy system access to profit loss" ON public.profit_loss
FOR ALL USING (true) WITH CHECK (true);

-- Update inventory_items table
DROP POLICY IF EXISTS "Allow legacy system access to inventory items" ON public.inventory_items;
CREATE POLICY "Allow legacy system access to inventory items" ON public.inventory_items
FOR ALL USING (true) WITH CHECK (true);

-- Update groups table
DROP POLICY IF EXISTS "Allow legacy system access to groups" ON public.groups;
CREATE POLICY "Allow legacy system access to groups" ON public.groups
FOR ALL USING (true) WITH CHECK (true);

-- Update group_items table
DROP POLICY IF EXISTS "Allow legacy system access to group items" ON public.group_items;
CREATE POLICY "Allow legacy system access to group items" ON public.group_items
FOR ALL USING (true) WITH CHECK (true);

-- Update daily_attendance table
DROP POLICY IF EXISTS "Allow legacy system access to daily attendance" ON public.daily_attendance;
CREATE POLICY "Allow legacy system access to daily attendance" ON public.daily_attendance
FOR ALL USING (true) WITH CHECK (true);

-- Update attendance_periods table
DROP POLICY IF EXISTS "Allow legacy system access to attendance periods" ON public.attendance_periods;
CREATE POLICY "Allow legacy system access to attendance periods" ON public.attendance_periods
FOR ALL USING (true) WITH CHECK (true);

-- Update attendance_tracking table
DROP POLICY IF EXISTS "Allow legacy system access to attendance tracking" ON public.attendance_tracking;
CREATE POLICY "Allow legacy system access to attendance tracking" ON public.attendance_tracking
FOR ALL USING (true) WITH CHECK (true);

-- Update employee_monthly_summary table
DROP POLICY IF EXISTS "Allow legacy system access to employee monthly summaries" ON public.employee_monthly_summary;
CREATE POLICY "Allow legacy system access to employee monthly summaries" ON public.employee_monthly_summary
FOR ALL USING (true) WITH CHECK (true);