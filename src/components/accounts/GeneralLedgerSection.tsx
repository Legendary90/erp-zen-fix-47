import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GLEntry {
  id: string;
  period_id: string;
  account_id: string;
  transaction_date: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  reference_type: string;
  reference_id: string;
  created_at: string;
  accounts: {
    account_code: string;
    account_name: string;
  };
  accounting_periods: {
    period_name: string;
  };
}

interface Account {
  id: string;
  account_code: string;
  account_name: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function GeneralLedgerSection() {
  const [entries, setEntries] = useState<GLEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [referenceType, setReferenceType] = useState('journal');
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    if (!clientId) return;

    // Fetch entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('general_ledger')
      .select(`
        *,
        accounts(account_code, account_name),
        accounting_periods(period_name)
      `)
      .eq('client_id', clientId)
      .order('transaction_date', { ascending: false });

    if (entriesError) {
      toast({
        title: "Error",
        description: "Failed to fetch general ledger entries",
        variant: "destructive",
      });
    } else {
      setEntries(entriesData || []);
    }

    // Fetch accounts
    const { data: accountsData, error: accountsError } = await supabase
      .from('accounts')
      .select('id, account_code, account_name')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('account_code');

    if (!accountsError) {
      setAccounts(accountsData || []);
    }

    // Fetch periods
    const { data: periodsData, error: periodsError } = await supabase
      .from('accounting_periods')
      .select('id, period_name, status')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });

    if (!periodsError) {
      setPeriods(periodsData || []);
      // Set active period as default
      const activePeriod = periodsData?.find(p => p.status === 'active');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    }
  };

  const createEntry = async () => {
    if (!selectedPeriod || !selectedAccount || !transactionDate || !description || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const debit = parseFloat(debitAmount) || 0;
    const credit = parseFloat(creditAmount) || 0;

    if (debit === 0 && credit === 0) {
      toast({
        title: "Error",
        description: "Please enter either a debit or credit amount",
        variant: "destructive",
      });
      return;
    }

    if (debit > 0 && credit > 0) {
      toast({
        title: "Error",
        description: "Please enter either a debit OR credit amount, not both",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('general_ledger')
      .insert([{
        client_id: clientId,
        period_id: selectedPeriod,
        account_id: selectedAccount,
        transaction_date: transactionDate,
        description: description,
        debit_amount: debit,
        credit_amount: credit,
        reference_type: referenceType
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create general ledger entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "General ledger entry created successfully",
      });
      setTransactionDate('');
      setDescription('');
      setDebitAmount('');
      setCreditAmount('');
      setIsDialogOpen(false);
      fetchData();
    }
  };

  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0);
  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">General Ledger</h3>
          <p className="text-muted-foreground">Complete record of all financial transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create General Ledger Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period">Accounting Period</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter transaction description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">Debit Amount</Label>
                  <Input
                    id="debit"
                    type="number"
                    step="0.01"
                    value={debitAmount}
                    onChange={(e) => {
                      setCreditAmount('');
                      setDebitAmount(e.target.value);
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">Credit Amount</Label>
                  <Input
                    id="credit"
                    type="number"
                    step="0.01"
                    value={creditAmount}
                    onChange={(e) => {
                      setDebitAmount('');
                      setCreditAmount(e.target.value);
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference-type">Reference Type</Label>
                <Select value={referenceType} onValueChange={setReferenceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">Journal Entry</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createEntry}>Create Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDebits.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCredits.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.transaction_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.accounts.account_code}</div>
                    <div className="text-sm text-muted-foreground">{entry.accounts.account_name}</div>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {entry.debit_amount > 0 ? `$${entry.debit_amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {entry.credit_amount > 0 ? `$${entry.credit_amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>{entry.accounting_periods.period_name}</TableCell>
                  <TableCell className="capitalize">{entry.reference_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No general ledger entries found. Create your first entry to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}