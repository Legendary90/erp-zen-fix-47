import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PurchaseEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  month_number: number;
  year: number;
  client_id: string;
}

export function PurchasesSection() {
  const [purchaseEntries, setPurchaseEntries] = useState<PurchaseEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    fetchPurchaseEntries();
  }, [user, currentMonth, currentYear]);

  const fetchPurchaseEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('purchase_entries')
      .select('*')
      .eq('client_id', user.client_id)
      .eq('month_number', currentMonth)
      .eq('year', currentYear)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch purchase entries",
        variant: "destructive",
      });
    } else {
      setPurchaseEntries(data || []);
    }
  };

  const addPurchaseEntry = async () => {
    if (!formData.description || !formData.amount || !user) return;

    const { error } = await supabase
      .from('purchase_entries')
      .insert([
        {
          ...formData,
          amount: parseFloat(formData.amount),
          client_id: user.client_id,
          month_number: currentMonth,
          year: currentYear
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add purchase entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Purchase entry added successfully",
      });
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      fetchPurchaseEntries();
    }
  };

  const createNewMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth() + 1);
    setCurrentYear(now.getFullYear());
    fetchPurchaseEntries();
  };

  const totalPurchases = purchaseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Purchases Management</h3>
          <p className="text-muted-foreground">Track raw materials, supplies, and vendor payments</p>
          <p className="text-sm text-muted-foreground">
            Current Period: {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createNewMonth}>
            New Month
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Purchase Entry</DialogTitle>
                <DialogDescription>Record a new purchase transaction</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Raw materials, supplies, etc."
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
                    placeholder="Materials, tools, etc."
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
                <Button onClick={addPurchaseEntry}>Add Purchase</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Purchases This Month</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalPurchases.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Entries</CardTitle>
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
              {purchaseEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category || '-'}</TableCell>
                  <TableCell>${entry.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {purchaseEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No purchase entries for this month. Add your first purchase to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}