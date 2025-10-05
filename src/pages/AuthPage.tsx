import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsClient, loginAsAdmin, registerClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('client-login');

  // Client Login Form State
  const [clientLoginForm, setClientLoginForm] = useState({
    username: '',
    password: ''
  });

  // Admin Login Form State
  const [adminLoginForm, setAdminLoginForm] = useState({
    username: '',
    password: ''
  });

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    companyName: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await loginAsClient(clientLoginForm.username, clientLoginForm.password);
    if (success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await loginAsAdmin(adminLoginForm.username, adminLoginForm.password);
    if (success) {
      navigate('/admin');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const success = await registerClient(
      registerForm.companyName,
      registerForm.password,
      registerForm.email || undefined,
      registerForm.phone || undefined
    );
    
    if (success) {
      setRegisterForm({ companyName: '', password: '', confirmPassword: '', email: '', phone: '' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">InviX ERP System</h1>
          <p className="text-muted-foreground">Access your business management dashboard</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client-login">Client Login</TabsTrigger>
            <TabsTrigger value="admin-login">
              <div className="flex items-center gap-1">
                Admin
                <Badge variant="secondary" className="text-xs">ADMIN</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="client-login">
            <Card>
              <CardHeader>
                <CardTitle>Client Login</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-username">Company Name / Username</Label>
                    <Input
                      id="client-username"
                      type="text"
                      placeholder="Enter your company name"
                      value={clientLoginForm.username}
                      onChange={(e) => setClientLoginForm({ ...clientLoginForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password</Label>
                    <Input
                      id="client-password"
                      type="password"
                      placeholder="Enter your password"
                      value={clientLoginForm.password}
                      onChange={(e) => setClientLoginForm({ ...clientLoginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In as Client'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Admin Login
                  <Badge variant="destructive">RESTRICTED</Badge>
                </CardTitle>
                <CardDescription>Administrator access only</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Admin Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Enter admin username"
                      value={adminLoginForm.username}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminLoginForm.password}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="destructive">
                    {isLoading ? 'Signing In...' : 'Sign In as Admin'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register New Client</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Enter your company name"
                      value={registerForm.companyName}
                      onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register Company'}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Your account will be reviewed and activated by an administrator. You will receive confirmation once approved.
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;