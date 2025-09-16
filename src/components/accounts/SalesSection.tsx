import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SalesEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  payment_status: string;
  client_id: string;
}

export function SalesSection() {
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    payment_status: 'paid',
    date: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesEntries();
  }, [user]);

  const fetchSalesEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('sales_entries')
      .select('*')
      .eq('client_id', user.client_id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales entries",
        variant: "destructive",
      });
    } else {
      setSalesEntries(data || []);
    }
  };

  const addSalesEntry = async () => {
    if (!formData.description || !formData.amount || !user) return;

    const { error } = await supabase
      .from('sales_entries')
      .insert([
        {
          ...formData,
          amount: parseFloat(formData.amount),
          client_id: user.client_id
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add sales entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sales entry added successfully",
      });
      setFormData({
        description: '',
        amount: '',
        category: '',
        payment_status: 'paid',
        date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      fetchSalesEntries();
    }
  };

  const totalSales = salesEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const paidSales = salesEntries.filter(entry => entry.payment_status === 'paid').reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Sales Management</h3>
          <p className="text-muted-foreground">Track sales, invoices, and customer payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Sales Entry</DialogTitle>
              <DialogDescription>Record a new sale transaction</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Sale description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Product category"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addSalesEntry}>Add Sale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${(totalSales - paidSales).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category || '-'}</TableCell>
                  <TableCell>${entry.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={entry.payment_status === 'paid' ? 'default' : entry.payment_status === 'pending' ? 'secondary' : 'destructive'}>
                      {entry.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {salesEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sales entries yet. Add your first sale to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}