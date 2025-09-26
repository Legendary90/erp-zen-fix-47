import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, CreditCard, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AssetLiability {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  name: string;
  amount: number;
  description?: string;
  date_recorded: string;
}

export function AssetsLiabilitiesSection() {
  const [items, setItems] = useState<AssetLiability[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetLiability | null>(null);
  const [formData, setFormData] = useState({
    type: 'asset' as 'asset' | 'liability',
    category: '',
    name: '',
    amount: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0]
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [clientId]);

  const fetchItems = async () => {
    if (!clientId) return;

    // Since we don't have assets_liabilities table, let's create records in a generic way
    // We'll use sales_entries for assets (positive) and expense_entries for liabilities (negative amounts)
    try {
      // Get assets from sales entries marked as assets
      const { data: assetsData } = await supabase
        .from('sales_entries')
        .select('*')
        .eq('client_id', clientId)
        .like('category', '%asset%');

      // Get liabilities from expense entries marked as liabilities  
      const { data: liabilitiesData } = await supabase
        .from('expense_entries')
        .select('*')
        .eq('client_id', clientId)
        .like('category', '%liability%');

      const combinedItems: AssetLiability[] = [
        ...(assetsData || []).map(item => ({
          id: item.id,
          type: 'asset' as const,
          category: item.category || 'Current Assets',
          name: item.description,
          amount: item.amount,
          description: item.description,
          date_recorded: item.date
        })),
        ...(liabilitiesData || []).map(item => ({
          id: item.id,
          type: 'liability' as const,
          category: item.category || 'Current Liabilities',
          name: item.description,
          amount: item.amount,
          description: item.description,
          date_recorded: item.date
        }))
      ];

      setItems(combinedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'asset',
      category: '',
      name: '',
      amount: '',
      description: '',
      date_recorded: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
  };

  const saveItem = async () => {
    if (!formData.name || !formData.amount || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const table = formData.type === 'asset' ? 'sales_entries' : 'expense_entries';
    const category = `${formData.category} (${formData.type})`;

    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from(table)
          .update({
            description: formData.name,
            amount: parseFloat(formData.amount),
            category: category,
            date: formData.date_recorded
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from(table)
          .insert({
            client_id: clientId,
            description: formData.name,
            amount: parseFloat(formData.amount),
            category: category,
            date: formData.date_recorded
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${formData.type} ${editingItem ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'create'} ${formData.type}`,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (item: AssetLiability) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    const table = item.type === 'asset' ? 'sales_entries' : 'expense_entries';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${item.type} deleted successfully`,
      });

      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${item.type}`,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: AssetLiability) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      category: item.category.replace(` (${item.type})`, ''),
      name: item.name,
      amount: item.amount.toString(),
      description: item.description || '',
      date_recorded: item.date_recorded
    });
    setIsDialogOpen(true);
  };

  const assets = items.filter(item => item.type === 'asset');
  const liabilities = items.filter(item => item.type === 'liability');
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Assets & Liabilities</h3>
          <p className="text-muted-foreground">Track your company's financial position</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add Asset/Liability'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'asset' | 'liability'})}
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Current Assets, Fixed Assets"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Asset/Liability name"
                />
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
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date_recorded}
                  onChange={(e) => setFormData({...formData, date_recorded: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveItem}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalAssets.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalLiabilities.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netWorth.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-mono">${item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItem(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {assets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No assets recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-mono">${item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItem(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {liabilities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No liabilities recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}