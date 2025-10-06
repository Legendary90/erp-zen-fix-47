import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Wallet, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CashBookEntry {
  id: string;
  entry_date: string;
  particulars: string;
  voucher_number: string | null;
  transaction_type: 'receipt' | 'payment';
  account_type: 'cash' | 'bank';
  account_name: string;
  amount: number;
  contra_account: string | null;
  narration: string | null;
  posted_to_ledger: boolean;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function CashBookSection() {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    particulars: '',
    voucher_number: '',
    transaction_type: 'receipt' as 'receipt' | 'payment',
    account_type: 'cash' as 'cash' | 'bank',
    account_name: 'Cash in Hand',
    amount: '',
    contra_account: '',
    narration: ''
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
      const { data, error } = await supabase
        .from('cash_book_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries((data || []) as CashBookEntry[]);
    } catch (error) {
      console.error('Error fetching cash book entries:', error);
    }
  };

  const addEntry = async () => {
    if (!formData.particulars || !formData.account_name || !clientId || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cash_book_entries')
        .insert({
          client_id: clientId,
          period_id: selectedPeriod,
          entry_date: formData.entry_date,
          particulars: formData.particulars,
          voucher_number: formData.voucher_number || null,
          transaction_type: formData.transaction_type,
          account_type: formData.account_type,
          account_name: formData.account_name,
          amount: amount,
          contra_account: formData.contra_account || null,
          narration: formData.narration || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cash book entry added and automatically posted to General Ledger",
      });

      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        particulars: '',
        voucher_number: '',
        transaction_type: 'receipt',
        account_type: 'cash',
        account_name: 'Cash in Hand',
        amount: '',
        contra_account: '',
        narration: ''
      });
      setIsDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Error adding cash book entry:', error);
      toast({
        title: "Error",
        description: "Failed to add cash book entry",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry? This will also remove the corresponding General Ledger entry.')) return;

    try {
      const { error } = await supabase
        .from('cash_book_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted and removed from General Ledger",
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

  // Calculate totals
  const cashReceipts = entries.filter(e => e.account_type === 'cash' && e.transaction_type === 'receipt').reduce((sum, e) => sum + e.amount, 0);
  const cashPayments = entries.filter(e => e.account_type === 'cash' && e.transaction_type === 'payment').reduce((sum, e) => sum + e.amount, 0);
  const bankReceipts = entries.filter(e => e.account_type === 'bank' && e.transaction_type === 'receipt').reduce((sum, e) => sum + e.amount, 0);
  const bankPayments = entries.filter(e => e.account_type === 'bank' && e.transaction_type === 'payment').reduce((sum, e) => sum + e.amount, 0);
  
  const cashBalance = cashReceipts - cashPayments;
  const bankBalance = bankReceipts - bankPayments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Cash Book</h3>
          <p className="text-muted-foreground">Record cash and bank receipts/payments - auto-posted to General Ledger</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Cash Book Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Entry Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voucher">Voucher Number</Label>
                  <Input
                    id="voucher"
                    value={formData.voucher_number}
                    onChange={(e) => setFormData({...formData, voucher_number: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_type">Transaction Type</Label>
                  <Select value={formData.transaction_type} onValueChange={(value: 'receipt' | 'payment') => setFormData({...formData, transaction_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value: 'cash' | 'bank') => setFormData({...formData, account_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  placeholder="e.g., Cash in Hand, Bank Account - HDFC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="particulars">Particulars</Label>
                <Input
                  id="particulars"
                  value={formData.particulars}
                  onChange={(e) => setFormData({...formData, particulars: e.target.value})}
                  placeholder="Description of transaction"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contra">Contra Account</Label>
                  <Input
                    id="contra"
                    value={formData.contra_account}
                    onChange={(e) => setFormData({...formData, contra_account: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="narration">Narration</Label>
                <Textarea
                  id="narration"
                  value={formData.narration}
                  onChange={(e) => setFormData({...formData, narration: e.target.value})}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addEntry}>Add & Post to Ledger</Button>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Receipts</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${cashReceipts.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${cashPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Receipts</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${bankReceipts.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${bankPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${cashBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${bankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${bankBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Book Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Voucher</th>
                  <th className="text-left p-2">Particulars</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Account</th>
                  <th className="text-right p-2">Cash Receipt</th>
                  <th className="text-right p-2">Cash Payment</th>
                  <th className="text-right p-2">Bank Receipt</th>
                  <th className="text-right p-2">Bank Payment</th>
                  <th className="text-center p-2">Posted</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td className="p-2">{entry.voucher_number || '-'}</td>
                    <td className="p-2">{entry.particulars}</td>
                    <td className="p-2">
                      <Badge variant={entry.transaction_type === 'receipt' ? 'default' : 'secondary'}>
                        {entry.transaction_type}
                      </Badge>
                    </td>
                    <td className="p-2">{entry.account_name}</td>
                    <td className="text-right p-2 text-green-600">
                      {entry.account_type === 'cash' && entry.transaction_type === 'receipt' ? `$${entry.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right p-2 text-red-600">
                      {entry.account_type === 'cash' && entry.transaction_type === 'payment' ? `$${entry.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right p-2 text-green-600">
                      {entry.account_type === 'bank' && entry.transaction_type === 'receipt' ? `$${entry.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right p-2 text-red-600">
                      {entry.account_type === 'bank' && entry.transaction_type === 'payment' ? `$${entry.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-center p-2">
                      {entry.posted_to_ledger && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                    </td>
                    <td className="text-center p-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={5} className="p-2 text-right">Totals:</td>
                  <td className="text-right p-2 text-green-600">${cashReceipts.toFixed(2)}</td>
                  <td className="text-right p-2 text-red-600">${cashPayments.toFixed(2)}</td>
                  <td className="text-right p-2 text-green-600">${bankReceipts.toFixed(2)}</td>
                  <td className="text-right p-2 text-red-600">${bankPayments.toFixed(2)}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={5} className="p-2 text-right">Balances:</td>
                  <td colSpan={2} className={`text-center p-2 ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Cash: ${cashBalance.toFixed(2)}
                  </td>
                  <td colSpan={2} className={`text-center p-2 ${bankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Bank: ${bankBalance.toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}