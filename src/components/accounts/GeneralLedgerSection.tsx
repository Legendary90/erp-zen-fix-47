import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExcelTable } from '@/components/common/ExcelTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LedgerEntry {
  id: string;
  transaction_date: string;
  description: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  reference_type: string;
  period_id: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function GeneralLedgerSection() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    account_name: '',
    debit_amount: '',
    credit_amount: '',
    reference_type: 'manual'
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchEntries();
    }
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .select('*')
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPeriods(data || []);

      const activePeriod = data?.find(p => p.status === 'active');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchEntries = async () => {
    if (!clientId || !selectedPeriod) return;

    try {
      // Get sales entries as credits
      const { data: salesData } = await supabase
        .from('sales_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod);

      // Get expense entries as debits
      const { data: expenseData } = await supabase
        .from('expense_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod);

      const combinedEntries: LedgerEntry[] = [
        ...(salesData || []).map(item => ({
          id: item.id,
          transaction_date: item.date,
          description: item.description,
          account_name: item.category || 'Sales Revenue',
          debit_amount: 0,
          credit_amount: item.amount,
          reference_type: 'sales',
          period_id: item.period_id
        })),
        ...(expenseData || []).map(item => ({
          id: item.id,
          transaction_date: item.date,
          description: item.description,
          account_name: item.category || 'Expenses',
          debit_amount: item.amount,
          credit_amount: 0,
          reference_type: 'expense',
          period_id: item.period_id
        }))
      ];

      // Sort by date descending
      combinedEntries.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
      setEntries(combinedEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const addEntry = async () => {
    if (!formData.description || !formData.account_name || !clientId || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a period",
        variant: "destructive",
      });
      return;
    }

    const debitAmount = parseFloat(formData.debit_amount) || 0;
    const creditAmount = parseFloat(formData.credit_amount) || 0;

    if (debitAmount === 0 && creditAmount === 0) {
      toast({
        title: "Error",
        description: "Please enter either a debit or credit amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // Determine which table to use based on debit/credit
      const table = debitAmount > 0 ? 'expense_entries' : 'sales_entries';
      const amount = debitAmount > 0 ? debitAmount : creditAmount;

      const { error } = await supabase
        .from(table)
        .insert({
          client_id: clientId,
          period_id: selectedPeriod,
          description: formData.description,
          amount: amount,
          date: formData.transaction_date,
          category: formData.account_name
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ledger entry added successfully",
      });

      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        account_name: '',
        debit_amount: '',
        credit_amount: '',
        reference_type: 'manual'
      });
      setIsDialogOpen(false);
      fetchEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ledger entry",
        variant: "destructive",
      });
    }
  };

  const onDelete = async (item: LedgerEntry) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const table = item.reference_type === 'expense' ? 'expense_entries' : 'sales_entries';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });

      fetchEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { key: 'transaction_date', label: 'Date', type: 'date' as const },
    { key: 'description', label: 'Description', type: 'text' as const },
    { key: 'account_name', label: 'Account', type: 'text' as const },
    { key: 'debit_amount', label: 'Debit', type: 'number' as const },
    { key: 'credit_amount', label: 'Credit', type: 'number' as const },
    { key: 'reference_type', label: 'Reference', type: 'text' as const }
  ];

  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0);
  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">General Ledger</h3>
          <p className="text-muted-foreground">Track all financial transactions and account balances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ledger Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Transaction Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account Name</Label>
                  <Input
                    id="account"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    placeholder="Account name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Transaction description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">Debit Amount</Label>
                  <Input
                    id="debit"
                    type="number"
                    step="0.01"
                    value={formData.debit_amount}
                    onChange={(e) => setFormData({...formData, debit_amount: e.target.value, credit_amount: ''})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">Credit Amount</Label>
                  <Input
                    id="credit"
                    type="number"
                    step="0.01"
                    value={formData.credit_amount}
                    onChange={(e) => setFormData({...formData, credit_amount: e.target.value, debit_amount: ''})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addEntry}>Add Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select accounting period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.period_name} ({period.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <BookOpen className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalDebits.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCredits.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <ExcelTable
        title="General Ledger Entries"
        columns={columns}
        data={entries}
        onDelete={onDelete}
        showActions={true}
        className="min-h-[400px]"
      />
    </div>
  );
}
