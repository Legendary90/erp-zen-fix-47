import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Star, Building, Trash2, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CustomerRelation {
  id: string;
  customer_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  company_type: string;
  industry: string;
  status: string;
  rating: number;
  relationship_type: string;
  notes: string;
  last_contact_date: string;
  created_at: string;
}

export function CustomerSalesSection() {
  const [customers, setCustomers] = useState<CustomerRelation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRelation | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    company_type: '',
    industry: '',
    status: 'active',
    rating: '5',
    relationship_type: '',
    notes: '',
    last_contact_date: new Date().toISOString().split('T')[0]
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [clientId]);

  const fetchCustomers = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('customer_relations')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer relations",
        variant: "destructive",
      });
    } else {
      setCustomers(data || []);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      company_type: '',
      industry: '',
      status: 'active',
      rating: '5',
      relationship_type: '',
      notes: '',
      last_contact_date: new Date().toISOString().split('T')[0]
    });
    setEditingCustomer(null);
  };

  const createCustomer = async () => {
    if (!formData.customer_name || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('customer_relations')
      .insert([{
        client_id: clientId,
        customer_name: formData.customer_name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        company_type: formData.company_type || null,
        industry: formData.industry || null,
        status: formData.status,
        rating: parseInt(formData.rating) || 5,
        relationship_type: formData.relationship_type || null,
        notes: formData.notes || null,
        last_contact_date: formData.last_contact_date || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create customer relation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Customer relation created successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchCustomers();
    }
  };

  const updateCustomer = async () => {
    if (!editingCustomer || !formData.customer_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('customer_relations')
      .update({
        customer_name: formData.customer_name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        company_type: formData.company_type || null,
        industry: formData.industry || null,
        status: formData.status,
        rating: parseInt(formData.rating) || 5,
        relationship_type: formData.relationship_type || null,
        notes: formData.notes || null,
        last_contact_date: formData.last_contact_date || null
      })
      .eq('id', editingCustomer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update customer relation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Customer relation updated successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchCustomers();
    }
  };

  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete customer relation "${customerName}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('customer_relations')
      .delete()
      .eq('id', customerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer relation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Customer relation deleted successfully",
      });
      fetchCustomers();
    }
  };

  const openEditDialog = (customer: CustomerRelation) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name,
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      company_type: customer.company_type || '',
      industry: customer.industry || '',
      status: customer.status,
      rating: customer.rating.toString(),
      relationship_type: customer.relationship_type || '',
      notes: customer.notes || '',
      last_contact_date: customer.last_contact_date || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCustomer) {
      updateCustomer();
    } else {
      createCustomer();
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const averageRating = customers.length > 0 
    ? (customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Customer Relations</h3>
          <p className="text-muted-foreground">Manage customer relationships, contacts, and engagement history</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Customer Relation' : 'Add New Customer Relation'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name *</Label>
                  <Input
                    id="customer-name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="ABC Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Company address..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-type">Company Type</Label>
                  <Select value={formData.company_type} onValueChange={(value) => setFormData({...formData, company_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Limited Company">Limited Company</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    placeholder="Technology"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="former">Former Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Select value={formData.rating} onValueChange={(value) => setFormData({...formData, rating: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ 1 Star</SelectItem>
                      <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-contact">Last Contact</Label>
                  <Input
                    id="last-contact"
                    type="date"
                    value={formData.last_contact_date}
                    onChange={(e) => setFormData({...formData, last_contact_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship-type">Relationship Type</Label>
                <Input
                  id="relationship-type"
                  value={formData.relationship_type}
                  onChange={(e) => setFormData({...formData, relationship_type: e.target.value})}
                  placeholder="Strategic Partner, Key Client, Regular Client, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional information about the customer relationship..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingCustomer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Relations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.customer_name}</div>
                    {customer.contact_person && (
                      <div className="text-sm text-muted-foreground">{customer.contact_person}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {customer.company_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-3 w-3" />
                          {customer.company_type}
                        </div>
                      )}
                      {customer.industry && (
                        <div className="text-sm text-muted-foreground">{customer.industry}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.relationship_type && (
                      <Badge variant="outline">{customer.relationship_type}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{customer.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      customer.status === 'active' ? 'default' : 
                      customer.status === 'prospect' ? 'secondary' : 
                      'outline'
                    }>
                      {customer.status === 'active' ? 'Active' : 
                       customer.status === 'prospect' ? 'Prospect' :
                       customer.status === 'inactive' ? 'Inactive' : 'Former'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCustomer(customer.id, customer.customer_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {customers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No customer relations found. Add your first customer relationship to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}