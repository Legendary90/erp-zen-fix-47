import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, DollarSign, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  method: string;
  period_id?: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function BankingSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'incoming',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'bank'
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchTransactions();
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

  const fetchTransactions = async () => {
    if (!clientId || !selectedPeriod) return;

    try {
      // Get incoming transactions from sales_entries
      const { data: salesData } = await supabase
        .from('sales_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod);

      // Get outgoing transactions from expense_entries  
      const { data: expenseData } = await supabase
        .from('expense_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod);

      const combinedTransactions: Transaction[] = [
        ...(salesData || []).map(item => ({
          id: item.id,
          type: 'incoming',
          amount: item.amount,
          description: item.description,
          date: item.date,
          method: 'bank',
          period_id: item.period_id
        })),
        ...(expenseData || []).map(item => ({
          id: item.id,
          type: 'outgoing',
          amount: item.amount,
          description: item.description,
          date: item.date,
          method: 'bank',
          period_id: item.period_id
        }))
      ];

      // Sort by date descending
      combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(combinedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addTransaction = async () => {
    if (!formData.amount || !formData.description || !clientId || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a period",
        variant: "destructive",
      });
      return;
    }

    const table = formData.type === 'incoming' ? 'sales_entries' : 'expense_entries';

    try {
      const { error } = await supabase
        .from(table)
        .insert({
          client_id: clientId,
          period_id: selectedPeriod,
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          category: formData.type === 'incoming' ? 'Banking Income' : 'Banking Expense'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      setFormData({
        type: 'incoming',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        method: 'bank'
      });
      setIsDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const table = type === 'incoming' ? 'sales_entries' : 'expense_entries';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });

      fetchTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const totalIncoming = transactions
    .filter(t => t.type === 'incoming')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalOutgoing = transactions
    .filter(t => t.type === 'outgoing')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Banking & Treasury</h3>
          <p className="text-muted-foreground">Monitor cash flow, bank transactions, and payment tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Banking Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Incoming Payment</SelectItem>
                      <SelectItem value="outgoing">Outgoing Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Transaction description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTransaction}>Add Transaction</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncoming.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOutgoing.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalIncoming - totalOutgoing) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncoming - totalOutgoing).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All banking transactions for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`capitalize ${transaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell className="capitalize">{transaction.method}</TableCell>
                  <TableCell className={transaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'incoming' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTransaction(transaction.id, transaction.type)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions recorded for this period yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}