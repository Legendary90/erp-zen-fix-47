import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  current_stock: number;
  created_at: string;
  updated_at: string;
  client_id: string;
}

export function InventoryTab() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryItems();
  }, [clientId]);

  const fetchInventoryItems = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    } else {
      setInventoryItems(data || []);
    }
  };

  const addInventoryItem = async () => {
    if (!newItemName.trim() || !newItemStock || !clientId) return;

    const { error } = await supabase
      .from('inventory_items')
      .insert([
        {
          name: newItemName,
          current_stock: parseInt(newItemStock),
          client_id: clientId
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      setNewItemName('');
      setNewItemStock('');
      setIsDialogOpen(false);
      fetchInventoryItems();
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 10) return { variant: 'destructive' as const, label: 'Low Stock' };
    if (stock <= 50) return { variant: 'secondary' as const, label: 'Medium Stock' };
    return { variant: 'default' as const, label: 'Good Stock' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Monitor and manage your inventory levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new item to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-right">
                  Product Name
                </Label>
                <Input
                  id="item-name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-stock" className="text-right">
                  Current Stock
                </Label>
                <Input
                  id="item-stock"
                  type="number"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addInventoryItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {inventoryItems.filter(item => item.current_stock <= 10).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryItems.reduce((sum, item) => sum + item.current_stock, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Current stock levels and status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => {
                const status = getStockStatus(item.current_stock);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.current_stock}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {inventoryItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items added yet. Add your first item to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}