import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Calendar, Receipt, TrendingDown } from 'lucide-react';

interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  period_id?: string;
}

interface MonthlyExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  month_number: number;
  year: number;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export function ExpensesSection() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeExpenseTab, setActiveExpenseTab] = useState('daily');
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

  const fetchExpenseEntries = async () => {
    if (!clientId || !selectedPeriod) return;

    try {
      const { data, error } = await supabase
        .from('expense_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenseEntries(data || []);
    } catch (error) {
      console.error('Error fetching expense entries:', error);
    }
  };

  const fetchMonthlyExpenses = async () => {
    if (!clientId) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('client_id', clientId)
        .eq('month_number', currentMonth)
        .eq('year', currentYear)
        .order('date', { ascending: false });

      if (error) throw error;
      setMonthlyExpenses(data || []);
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
    }
  };

  useEffect(() => {
    fetchAccountingPeriods();
    fetchMonthlyExpenses();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchExpenseEntries();
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

  const addExpense = async () => {
    if (!clientId || !newEntry.description || !newEntry.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const entryDate = new Date(newEntry.date);
    const table = activeExpenseTab === 'daily' ? 'expense_entries' : 'monthly_expenses';
    
    const insertData: any = {
      client_id: clientId,
      description: newEntry.description,
      amount: parseFloat(newEntry.amount),
      date: newEntry.date,
      category: newEntry.category || null
    };

    if (activeExpenseTab === 'daily' && selectedPeriod) {
      insertData.period_id = selectedPeriod;
    }

    if (activeExpenseTab === 'monthly') {
      insertData.month_number = entryDate.getMonth() + 1;
      insertData.year = entryDate.getFullYear();
    }

    try {
      const { error } = await supabase
        .from(table)
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense entry added successfully"
      });

      setNewEntry({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
      setIsDialogOpen(false);

      if (activeExpenseTab === 'daily') {
        fetchExpenseEntries();
      } else {
        fetchMonthlyExpenses();
      }
    } catch (error) {
      console.error('Error adding expense entry:', error);
      toast({
        title: "Error",
        description: "Failed to add expense entry",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (id: string, isMonthly: boolean = false) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;

    const table = isMonthly ? 'monthly_expenses' : 'expense_entries';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense entry deleted successfully"
      });

      if (isMonthly) {
        fetchMonthlyExpenses();
      } else {
        fetchExpenseEntries();
      }
    } catch (error) {
      console.error('Error deleting expense entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense entry",
        variant: "destructive"
      });
    }
  };

  const totalDailyExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-600" />
            Expense Control Center
          </h3>
          <p className="text-muted-foreground">Comprehensive operational and overhead expense tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewPeriod} variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            New Period
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense Entry</DialogTitle>
                <DialogDescription>Record a new expense transaction</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Enter expense description"
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
                    placeholder="e.g., Utilities, Rent, Salaries"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={addExpense}>Add Entry</Button>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              ${totalDailyExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              ${totalMonthlyExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeExpenseTab} onValueChange={setActiveExpenseTab}>
        <TabsList className="grid w-full grid-cols-2 bg-card border">
          <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
            Daily Expenses
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
            Monthly Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Expense Entries</CardTitle>
              <CardDescription>Operational expenses for the selected accounting period</CardDescription>
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
                    {expenseEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{entry.category || '-'}</TableCell>
                        <TableCell className="font-mono">${entry.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteExpense(entry.id, false)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {expenseEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No daily expense entries found for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Entries</CardTitle>
              <CardDescription>Recurring monthly expenses and overhead costs</CardDescription>
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
                    {monthlyExpenses.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{entry.category || '-'}</TableCell>
                        <TableCell className="font-mono">${entry.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteExpense(entry.id, true)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {monthlyExpenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No monthly expense entries found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}