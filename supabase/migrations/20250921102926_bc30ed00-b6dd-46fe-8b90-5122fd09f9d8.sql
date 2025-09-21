-- Create employees table
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    hire_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    attendance_days INTEGER DEFAULT 0,
    leave_days INTEGER DEFAULT 0,
    salary NUMERIC,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal_documents table
CREATE TABLE public.legal_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    issue_date DATE,
    expiry_date DATE,
    document_number TEXT,
    authority TEXT,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_relations table
CREATE TABLE public.customer_relations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    company_type TEXT,
    industry TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    rating INTEGER DEFAULT 5,
    relationship_type TEXT,
    notes TEXT,
    last_contact_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_relations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for client data" ON public.employees
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for client data" ON public.legal_documents
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for client data" ON public.customer_relations
FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO public.employees (client_id, employee_code, name, position, email, phone, hire_date, status, attendance_days, leave_days, salary, department) VALUES
('CLI_DEFAULT', 'EMP-001', 'John Doe', 'Manager', 'john.doe@company.com', '+1-555-0101', '2023-01-15', 'active', 22, 3, 75000.00, 'Administration'),
('CLI_DEFAULT', 'EMP-002', 'Jane Smith', 'Senior Associate', 'jane.smith@company.com', '+1-555-0102', '2023-03-20', 'active', 20, 5, 65000.00, 'Sales'),
('CLI_DEFAULT', 'EMP-003', 'Mike Johnson', 'Accountant', 'mike.johnson@company.com', '+1-555-0103', '2023-06-10', 'active', 18, 2, 55000.00, 'Finance'),
('CLI_DEFAULT', 'EMP-004', 'Sarah Wilson', 'HR Specialist', 'sarah.wilson@company.com', '+1-555-0104', '2023-09-05', 'on_leave', 15, 10, 60000.00, 'Human Resources');

INSERT INTO public.legal_documents (client_id, document_type, title, description, status, issue_date, expiry_date, document_number, authority) VALUES
('CLI_DEFAULT', 'License', 'Business License', 'General business operating license', 'active', '2024-01-01', '2024-12-31', 'BL-2024-001', 'City Business Authority'),
('CLI_DEFAULT', 'Contract', 'Supplier Agreement', 'Main supplier contract for raw materials', 'active', '2024-02-15', '2025-02-14', 'SA-2024-001', 'Legal Department'),
('CLI_DEFAULT', 'Insurance', 'General Liability Insurance', 'Comprehensive business liability coverage', 'active', '2024-01-01', '2024-12-31', 'GLI-2024-001', 'ABC Insurance Company'),
('CLI_DEFAULT', 'Permit', 'Environmental Permit', 'Environmental compliance permit', 'active', '2024-03-01', '2025-02-28', 'EP-2024-001', 'Environmental Agency'),
('CLI_DEFAULT', 'Certificate', 'ISO 9001 Certification', 'Quality management system certification', 'active', '2024-01-15', '2027-01-14', 'ISO-2024-001', 'ISO Certification Body');

INSERT INTO public.customer_relations (client_id, customer_name, contact_person, email, phone, address, company_type, industry, status, rating, relationship_type, notes, last_contact_date) VALUES
('CLI_DEFAULT', 'TechCorp Solutions', 'David Brown', 'david.brown@techcorp.com', '+1-555-2001', '123 Tech Street, Silicon Valley, CA', 'Corporation', 'Technology', 'active', 5, 'Strategic Partner', 'Long-term strategic partnership for software solutions', '2024-03-15'),
('CLI_DEFAULT', 'Green Energy Ltd', 'Lisa Green', 'lisa.green@greenenergy.com', '+1-555-2002', '456 Renewable Ave, Austin, TX', 'Limited Company', 'Energy', 'active', 4, 'Key Client', 'Major client for renewable energy consulting', '2024-03-10'),
('CLI_DEFAULT', 'Metro Manufacturing', 'Robert Metro', 'robert.metro@metro.com', '+1-555-2003', '789 Industrial Blvd, Detroit, MI', 'Corporation', 'Manufacturing', 'active', 4, 'Regular Client', 'Regular manufacturing consulting services', '2024-03-05'),
('CLI_DEFAULT', 'StartUp Innovations', 'Emma Startup', 'emma@startupinno.com', '+1-555-2004', '321 Innovation Hub, San Francisco, CA', 'Startup', 'Technology', 'prospect', 3, 'Prospect', 'Potential client for startup consulting', '2024-02-28'),
('CLI_DEFAULT', 'Global Retail Chain', 'Mark Global', 'mark.global@retailchain.com', '+1-555-2005', '654 Retail Plaza, New York, NY', 'Corporation', 'Retail', 'inactive', 2, 'Former Client', 'Former client, relationship ended due to budget constraints', '2024-01-15');