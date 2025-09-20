import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Eye, EyeOff, Plus, Settings, Users, Shield, Database } from 'lucide-react';

interface Client {
  id: string;
  client_id: string;
  username: string;
  company_name: string;
  email: string;
  phone: string;
  password_hash: string;
  access_status: boolean;
  subscription_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  last_login: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const togglePasswordVisibility = (clientId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const updateClientStatus = async (clientId: string, accessStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ access_status: accessStatus })
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client access ${accessStatus ? 'enabled' : 'disabled'}`
      });

      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive"
      });
    }
  };

  const updateClientPassword = async () => {
    if (!editingClient || !newPassword) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ password_hash: newPassword })
        .eq('client_id', editingClient.client_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully"
      });

      setIsEditDialogOpen(false);
      setNewPassword('');
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully"
      });

      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    navigate('/admin/auth');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
                <p className="text-muted-foreground">Enterprise Client Management System</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-card border">
            <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Client Management</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>System Overview</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Center</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Client Database</span>
                  <Badge variant="secondary">{clients.length} Total Clients</Badge>
                </CardTitle>
                <CardDescription>
                  Comprehensive client information with password management and access control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Client ID</TableHead>
                        <TableHead className="font-semibold">Company</TableHead>
                        <TableHead className="font-semibold">Username</TableHead>
                        <TableHead className="font-semibold">Password</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Subscription</TableHead>
                        <TableHead className="font-semibold">Last Login</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">{client.client_id}</TableCell>
                          <TableCell className="font-medium">{client.company_name}</TableCell>
                          <TableCell>{client.username}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm">
                                {showPassword[client.id] ? client.password_hash : '••••••••'}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility(client.id)}
                              >
                                {showPassword[client.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{client.email}</div>
                              <div className="text-muted-foreground">{client.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={client.access_status}
                                onCheckedChange={(checked) => updateClientStatus(client.client_id, checked)}
                              />
                              <span className="text-sm">
                                {client.access_status ? 'Active' : 'Blocked'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(client.subscription_status)}</TableCell>
                          <TableCell className="text-sm">
                            {client.last_login ? new Date(client.last_login).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={isEditDialogOpen && editingClient?.id === client.id} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingClient(client)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Client Password</DialogTitle>
                                    <DialogDescription>
                                      Change password for {client.company_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="newPassword">New Password</Label>
                                      <Input
                                        id="newPassword"
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setNewPassword('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={updateClientPassword}>
                                      Update Password
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteClient(client.client_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Clients:</span>
                      <span className="font-bold">{clients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Clients:</span>
                      <span className="font-bold text-green-600">
                        {clients.filter(c => c.access_status).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocked Clients:</span>
                      <span className="font-bold text-red-600">
                        {clients.filter(c => !c.access_status).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Management</CardTitle>
                <CardDescription>
                  Monitor and manage system security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}