import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  client_id: string;
  username: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  access_status: boolean;
  subscription_status: string;
  subscription_start: string;
  subscription_end: string;
  created_at: string;
  last_login: string | null;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { adminSession, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminSession) {
      navigate('/admin');
      return;
    }
    fetchClients();
  }, [adminSession, navigate]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive"
        });
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClientAccess = async (clientId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          access_status: !currentStatus,
          subscription_status: !currentStatus ? 'ACTIVE' : 'INACTIVE'
        })
        .eq('id', clientId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update client access",
          variant: "destructive"
        });
        return;
      }

      setClients(clients.map(client => 
        client.id === clientId 
          ? { 
              ...client, 
              access_status: !currentStatus,
              subscription_status: !currentStatus ? 'ACTIVE' : 'INACTIVE'
            }
          : client
      ));

      toast({
        title: "Success",
        description: `Client access ${!currentStatus ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating client access:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (client: Client) => {
    if (!client.access_status) {
      return <Badge variant="destructive">Access Denied</Badge>;
    }
    
    if (client.subscription_status === 'ACTIVE') {
      return <Badge variant="default">Active</Badge>;
    }
    
    return <Badge variant="secondary">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage client access and subscriptions</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Total Clients: {clients.length} | 
                Active: {clients.filter(c => c.access_status && c.subscription_status === 'ACTIVE').length} | 
                Pending: {clients.filter(c => !c.access_status).length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No clients registered yet</p>
                ) : (
                  clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{client.company_name}</h3>
                          {getStatusBadge(client)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Client ID: {client.client_id}</p>
                          <p>Username: {client.username}</p>
                          {client.email && <p>Email: {client.email}</p>}
                          {client.phone && <p>Phone: {client.phone}</p>}
                          <p>Registered: {new Date(client.created_at).toLocaleDateString()}</p>
                          {client.last_login && (
                            <p>Last Login: {new Date(client.last_login).toLocaleDateString()}</p>
                          )}
                          <p>Subscription: {client.subscription_start} to {client.subscription_end}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={client.access_status}
                            onCheckedChange={() => toggleClientAccess(client.id, client.access_status)}
                          />
                          <span className="text-sm font-medium">
                            {client.access_status ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}