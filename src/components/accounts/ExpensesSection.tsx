import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  client_id: string;
}

interface MonthlyExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  month_number: number;
  year: number;
  client_id: string;
}

export function ExpensesSection() {
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeExpenseTab, setActiveExpenseTab] = useState('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenseEntries();
    fetchMonthlyExpenses();
  }, [user, currentMonth, currentYear]);

  const fetchExpenseEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expense_entries')
      .select('*')
      .eq('client_id', user.client_id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expense entries",
        variant: "destructive",
      });
    } else {
      setExpenseEntries(data || []);
    }
  };

  const fetchMonthlyExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('monthly_expenses')
      .select('*')
      .eq('client_id', user.client_id)
      .eq('month_number', currentMonth)
      .eq('year', currentYear)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch monthly expenses",
        variant: "destructive",
      });
    } else {
      setMonthlyExpenses(data || []);
    }
  };

  const addExpense = async () => {
    if (!formData.description || !formData.amount || !user) return;

    console.log('Adding expense with user:', user);
    console.log('Form data:', formData);
    
    const table = activeExpenseTab === 'daily' ? 'expense_entries' : 'monthly_expenses';
    const insertData = {
      ...formData,
      amount: parseFloat(formData.amount),
      client_id: user.client_id || user.id,
      ...(activeExpenseTab === 'monthly' && {
        month_number: currentMonth,
        year: currentYear
      })
    };

    console.log('Insert data:', insertData);

    const { data, error } = await supabase
      .from(table)
      .insert([insertData])
      .select();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Expense insert error:', error);
      toast({
        title: "Error",
        description: `Failed to add expense entry: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expense entry added successfully",
      });
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      fetchExpenseEntries();
      fetchMonthlyExpenses();
    }
  };

  const createNewMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth() + 1);
    setCurrentYear(now.getFullYear());
    fetchMonthlyExpenses();
  };

  const totalDailyExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6 bg-background">
      <div className="bg-card border border-sidebar-border rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-sidebar-primary flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              Expense Management System
            </h3>
            <p className="text-sidebar-foreground mt-1">Track operational expenses, overhead costs, and financial outflows</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="px-3 py-1 bg-sidebar-accent rounded-full text-sidebar-foreground">
                Module: Expense Tracking
              </span>
              <span className="px-3 py-1 bg-sidebar-accent rounded-full text-sidebar-foreground">
                Period: {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {activeExpenseTab === 'monthly' && (
              <Button variant="outline" onClick={createNewMonth} className="border-sidebar-border">
                New Month
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense Entry
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Expense Entry</DialogTitle>
                <DialogDescription>Record a new expense transaction</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Salary, electricity, rent, etc."
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
                    placeholder="Operations, utilities, etc."
                  />
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
                <Button onClick={addExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-sidebar-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-sidebar-background/50">
            <CardTitle className="text-sm font-semibold text-sidebar-primary">Daily Expenses Total</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-sidebar-primary">${totalDailyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-sm text-sidebar-foreground/70 mt-1">Current daily expense entries</p>
          </CardContent>
        </Card>
        <Card className="border-sidebar-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-sidebar-background/50">
            <CardTitle className="text-sm font-semibold text-sidebar-primary">Monthly Expenses Total</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-sidebar-primary">${totalMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-sm text-sidebar-foreground/70 mt-1">
              {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeExpenseTab} onValueChange={setActiveExpenseTab}>
        <TabsList className="bg-sidebar-background border border-sidebar-border">
          <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Expense Entries</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Monthly Expense Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Expense Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.category || '-'}</TableCell>
                      <TableCell>${entry.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {expenseEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No daily expenses recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Entries</CardTitle>
              <CardDescription>
                {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyExpenses.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.category || '-'}</TableCell>
                      <TableCell>${entry.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {monthlyExpenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No monthly expenses for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}