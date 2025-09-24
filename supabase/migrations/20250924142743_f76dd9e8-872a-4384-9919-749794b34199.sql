-- Add missing columns to admins table if they don't exist
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    return NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create or replace trigger for admins table
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default super admin (only if username doesn't exist)
INSERT INTO public.admins (username, password_hash, email, full_name, is_super_admin, is_active)
VALUES ('admin', 'admin123', 'admin@invix.com', 'System Administrator', true, true)
ON CONFLICT (username) DO NOTHING;

-- Update RLS policies for clients table to allow admin access
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert new clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;

-- Create simple admin policies that work
CREATE POLICY "Admins can view all clients" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "Admins can update all clients" ON public.clients
    FOR UPDATE USING (true);

CREATE POLICY "Admins can insert new clients" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete clients" ON public.clients
    FOR DELETE USING (true);

-- Update admin policies for admins table
DROP POLICY IF EXISTS "Admins can view all admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own account" ON public.admins;
DROP POLICY IF EXISTS "Super admins can insert new admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON public.admins;

CREATE POLICY "Admins can view all admin accounts" ON public.admins
    FOR SELECT USING (true);

CREATE POLICY "Admins can update their own account" ON public.admins
    FOR UPDATE USING (true);

CREATE POLICY "Super admins can insert new admins" ON public.admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can delete admins" ON public.admins
    FOR DELETE USING (true);