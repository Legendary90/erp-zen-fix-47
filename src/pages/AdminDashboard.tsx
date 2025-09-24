import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Trash2, Users, Building, DollarSign, Calendar } from 'lucide-react';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  username: string;
  email?: string;
  phone?: string;
  subscription_status: string;
  access_status: boolean;
  subscription_start: string;
  subscription_end: string;
  created_at: string;
  last_login?: string;
}

const AdminDashboard: React.FC = () => {
  const { adminSession, admin, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});

  // Redirect if not admin
  useEffect(() => {
    if (!adminSession || !admin) {
      navigate('/auth');
    }
  }, [adminSession, admin, navigate]);

  // Load clients data
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      company_name: client.company_name,
      username: client.username,
      email: client.email,
      phone: client.phone,
      subscription_status: client.subscription_status,
      access_status: client.access_status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update(editForm)
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully"
      });
      
      setIsEditModalOpen(false);
      loadClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete client "${client.company_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully"
      });
      
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      });
    }
  };

  const toggleClientAccess = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ access_status: !client.access_status })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client access ${!client.access_status ? 'enabled' : 'disabled'}`
      });
      
      loadClients();
    } catch (error) {
      console.error('Error updating client access:', error);
      toast({
        title: "Error",
        description: "Failed to update client access",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  const activeClients = clients.filter(c => c.access_status).length;
  const totalClients = clients.length;
  const paidSubscriptions = clients.filter(c => c.subscription_status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">InviX ERP - Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {admin?.full_name || admin?.username}</p>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Client Management</CardTitle>
              <Button onClick={() => navigate('/auth')} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.client_id}</TableCell>
                    <TableCell>{client.company_name}</TableCell>
                    <TableCell>{client.username}</TableCell>
                    <TableCell>{client.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={client.subscription_status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {client.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.access_status ? 'default' : 'destructive'}
                        className="cursor-pointer"
                        onClick={() => toggleClientAccess(client)}
                      >
                        {client.access_status ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.last_login ? new Date(client.last_login).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={editForm.company_name || ''}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editForm.username || ''}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleUpdateClient} className="flex-1">
                Update Client
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;