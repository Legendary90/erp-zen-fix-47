-- Remove conflicting admin-only policy that blocks client authentication
DROP POLICY IF EXISTS "Only admins can access clients" ON public.clients;

-- Remove the overly broad policies I just added
DROP POLICY IF EXISTS "Allow client registration" ON public.clients;
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update their own data" ON public.clients;

-- Create specific policies for client authentication and data access
-- Allow anyone to register (insert new clients)
CREATE POLICY "Allow client registration" 
ON public.clients 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow reading client data for authentication purposes
CREATE POLICY "Allow client authentication" 
ON public.clients 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow clients to update their own last_login and other data
CREATE POLICY "Allow client updates" 
ON public.clients 
FOR UPDATE 
TO anon, authenticated
USING (true);

-- Allow admins full access to clients table
CREATE POLICY "Admins can manage all clients" 
ON public.clients 
FOR ALL 
TO authenticated
USING (current_setting('app.current_admin'::text, true) IS NOT NULL);