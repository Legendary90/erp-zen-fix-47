import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface SalesEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  payment_status: string;
  period_id?: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface SalesSectionProps {
  navigateToAccountingPeriods?: () => void;
}

export function SalesSection({ navigateToAccountingPeriods }: SalesSectionProps = {}) {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    payment_status: 'paid'
  });

  const fetchAccountingPeriods = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .select('*')
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setAccountingPeriods(data || []);
      
      // Select active period by default
      const activePeriod = data?.find(p => p.status === 'active');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchSalesEntries = async () => {
    if (!clientId || !selectedPeriod) return;

    try {
      const { data, error } = await supabase
        .from('sales_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod)
        .order('date', { ascending: false });

      if (error) throw error;
      setSalesEntries(data || []);
    } catch (error) {
      console.error('Error fetching sales entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales entries",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAccountingPeriods();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchSalesEntries();
    }
  }, [selectedPeriod]);

  const createNewPeriod = async () => {
    if (!clientId) return;

    const currentDate = new Date();
    const periodName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
      // Close current active period
      await supabase
        .from('accounting_periods')
        .update({ status: 'closed' })
        .eq('client_id', clientId)
        .eq('status', 'active');

      // Create new period
      const { data, error } = await supabase
        .from('accounting_periods')
        .insert({
          client_id: clientId,
          period_name: periodName,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `New accounting period "${periodName}" created`
      });

      fetchAccountingPeriods();
      setSelectedPeriod(data.id);
    } catch (error) {
      console.error('Error creating period:', error);
      toast({
        title: "Error",
        description: "Failed to create new period",
        variant: "destructive"
      });
    }
  };

  const addSalesEntry = async () => {
    if (!clientId || !selectedPeriod || !newEntry.description || !newEntry.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sales_entries')
        .insert({
          client_id: clientId,
          period_id: selectedPeriod,
          description: newEntry.description,
          amount: parseFloat(newEntry.amount),
          date: newEntry.date,
          category: newEntry.category || null,
          payment_status: newEntry.payment_status
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales entry added successfully"
      });

      setNewEntry({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        payment_status: 'paid'
      });
      setIsDialogOpen(false);
      fetchSalesEntries();
    } catch (error) {
      console.error('Error adding sales entry:', error);
      toast({
        title: "Error",
        description: "Failed to add sales entry",
        variant: "destructive"
      });
    }
  };

  const deleteSalesEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sales entry?')) return;

    try {
      const { error } = await supabase
        .from('sales_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales entry deleted successfully"
      });

      fetchSalesEntries();
    } catch (error) {
      console.error('Error deleting sales entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete sales entry",
        variant: "destructive"
      });
    }
  };

  const totalSales = salesEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Revenue Management
          </h3>
          <p className="text-muted-foreground">Track and manage sales transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={navigateToAccountingPeriods} variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            New Period
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Sales Entry</DialogTitle>
                <DialogDescription>Record a new sales transaction</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Enter sales description"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                    placeholder="e.g., Product Sales, Services"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select value={newEntry.payment_status} onValueChange={(value) => setNewEntry({...newEntry, payment_status: value})}>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={addSalesEntry}>Add Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select accounting period" />
              </SelectTrigger>
              <SelectContent>
                {accountingPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.period_name} ({period.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-green-600">Rs</span>
              {totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>Detailed view of all sales entries for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell>{entry.category || '-'}</TableCell>
                    <TableCell className="font-mono">Rs {entry.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        entry.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSalesEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {salesEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sales entries found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}