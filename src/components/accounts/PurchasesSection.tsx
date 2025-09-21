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
import { Plus, Trash2, Calendar, ShoppingCart, Package } from 'lucide-react';

interface PurchaseEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  month_number: number;
  year: number;
  period_id?: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface PurchasesSectionProps {
  navigateToAccountingPeriods?: () => void;
}

export function PurchasesSection({ navigateToAccountingPeriods }: PurchasesSectionProps = {}) {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [purchaseEntries, setPurchaseEntries] = useState<PurchaseEntry[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
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
      
      const activePeriod = data?.find(p => p.status === 'active');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchPurchaseEntries = async () => {
    if (!clientId || !selectedPeriod) return;

    try {
      const { data, error } = await supabase
        .from('purchase_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod)
        .order('date', { ascending: false });

      if (error) throw error;
      setPurchaseEntries(data || []);
    } catch (error) {
      console.error('Error fetching purchase entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase entries",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAccountingPeriods();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPurchaseEntries();
    }
  }, [selectedPeriod]);

  const createNewPeriod = async () => {
    if (!clientId) return;

    const currentDate = new Date();
    const periodName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
      await supabase
        .from('accounting_periods')
        .update({ status: 'closed' })
        .eq('client_id', clientId)
        .eq('status', 'active');

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

  const addPurchaseEntry = async () => {
    if (!clientId || !selectedPeriod || !newEntry.description || !newEntry.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const entryDate = new Date(newEntry.date);
    
    try {
      const { error } = await supabase
        .from('purchase_entries')
        .insert({
          client_id: clientId,
          period_id: selectedPeriod,
          description: newEntry.description,
          amount: parseFloat(newEntry.amount),
          date: newEntry.date,
          category: newEntry.category || null,
          month_number: entryDate.getMonth() + 1,
          year: entryDate.getFullYear()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase entry added successfully"
      });

      setNewEntry({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
      setIsDialogOpen(false);
      fetchPurchaseEntries();
    } catch (error) {
      console.error('Error adding purchase entry:', error);
      toast({
        title: "Error",
        description: "Failed to add purchase entry",
        variant: "destructive"
      });
    }
  };

  const deletePurchaseEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase entry?')) return;

    try {
      const { error } = await supabase
        .from('purchase_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase entry deleted successfully"
      });

      fetchPurchaseEntries();
    } catch (error) {
      console.error('Error deleting purchase entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase entry",
        variant: "destructive"
      });
    }
  };

  const totalPurchases = purchaseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Procurement Management
          </h3>
          <p className="text-muted-foreground">Track supplier purchases and inventory acquisitions</p>
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
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Purchase Entry</DialogTitle>
                <DialogDescription>Record a new procurement transaction</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Enter purchase description"
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
                    placeholder="e.g., Raw Materials, Equipment, Services"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={addPurchaseEntry}>Add Entry</Button>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              ${totalPurchases.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Transactions</CardTitle>
          <CardDescription>Detailed view of all purchase entries for the selected period</CardDescription>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell>{entry.category || '-'}</TableCell>
                    <TableCell className="font-mono">${entry.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePurchaseEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {purchaseEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No purchase entries found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}