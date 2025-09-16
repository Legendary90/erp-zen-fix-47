import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  clientSession: string | null;
  adminSession: string | null;
  user: any | null;
  clientId: string | null;
  isLoading: boolean;
  loginAsClient: (username: string, password: string) => Promise<boolean>;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
  registerClient: (companyName: string, password: string, email?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientSession, setClientSession] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing sessions
    const storedClientSession = localStorage.getItem('client_session');
    const storedAdminSession = localStorage.getItem('admin_session');
    const storedClientId = localStorage.getItem('current_client_id');
    
    if (storedClientSession) {
      setClientSession(storedClientSession);
      if (storedClientId) {
        setClientId(storedClientId);
        setUser({ client_id: storedClientId });
      }
    }
    if (storedAdminSession) setAdminSession(storedAdminSession);
    
    setIsLoading(false);
  }, []);

  const loginAsClient = async (username: string, password: string): Promise<boolean> => {
    try {
      // First check if client exists and has access
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('access_status', true)
        .single();

      if (clientError || !client) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or access denied. Contact admin if account is inactive.",
          variant: "destructive"
        });
        return false;
      }

      // Update last login
      await supabase
        .from('clients')
        .update({ last_login: new Date().toISOString() })
        .eq('id', client.id);

      // Set session
      const sessionId = `client_${client.client_id}_${Date.now()}`;
      localStorage.setItem('client_session', sessionId);
      localStorage.setItem('current_client_id', client.client_id);
      setClientSession(sessionId);
      setClientId(client.client_id);
      setUser(client);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${client.company_name}!`
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
      return false;
    }
  };

  const loginAsAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin_user', {
        p_username: username,
        p_password: password
      });

      if (error || !data || data.length === 0) {
        toast({
          title: "Admin Login Failed",
          description: "Invalid admin credentials",
          variant: "destructive"
        });
        return false;
      }

      const sessionToken = data[0].session_token;
      localStorage.setItem('admin_session', sessionToken);
      setAdminSession(sessionToken);

      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin panel!"
      });

      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Admin Login Error",
        description: "An error occurred during admin login",
        variant: "destructive"
      });
      return false;
    }
  };

  const registerClient = async (companyName: string, password: string, email?: string, phone?: string): Promise<boolean> => {
    try {
      // Generate client ID
      const { data: clientIdData, error: clientIdError } = await supabase.rpc('generate_client_id');
      
      if (clientIdError) {
        toast({
          title: "Registration Failed",
          description: "Error generating client ID",
          variant: "destructive"
        });
        return false;
      }

      const clientId = clientIdData;

      // Create client record
      const { error: insertError } = await supabase
        .from('clients')
        .insert({
          client_id: clientId,
          username: companyName,
          company_name: companyName,
          password_hash: password,
          email: email || null,
          phone: phone || null,
          access_status: false, // Requires admin approval
          subscription_status: 'INACTIVE'
        });

      if (insertError) {
        toast({
          title: "Registration Failed",
          description: "Failed to create account. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Registration Successful",
        description: "Account created! Please wait for admin approval to access the system.",
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An error occurred during registration",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('client_session');
    localStorage.removeItem('admin_session');
    localStorage.removeItem('current_client_id');
    setClientSession(null);
    setAdminSession(null);
    setUser(null);
    setClientId(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
  };

  return (
    <AuthContext.Provider value={{
      clientSession,
      adminSession,
      user,
      clientId,
      isLoading,
      loginAsClient,
      loginAsAdmin,
      registerClient,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};