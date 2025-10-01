import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TaxRecord {
  id: string;
  type: string;
  amount: number;
  period: string;
  due_date: string;
  status: string;
  description: string;
  created_at: string;
}

export function TaxesSection() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    period: '',
    due_date: '',
    status: 'pending',
    description: ''
  });

  useEffect(() => {
    if (clientId) {
      loadTaxRecords();
    }
  }, [clientId]);

  const loadTaxRecords = async () => {
    if (!clientId) return;

    // Since we don't have a tax_records table, we'll use local state
    const storedRecords = localStorage.getItem(`tax_records_${clientId}`);
    if (storedRecords) {
      setTaxRecords(JSON.parse(storedRecords));
    }
  };

  const saveTaxRecords = (records: TaxRecord[]) => {
    if (clientId) {
      localStorage.setItem(`tax_records_${clientId}`, JSON.stringify(records));
      setTaxRecords(records);
    }
  };

  const addTaxRecord = () => {
    if (!formData.type || !formData.amount || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newRecord: TaxRecord = {
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      created_at: new Date().toISOString()
    };
    
    const updatedRecords = [newRecord, ...taxRecords];
    saveTaxRecords(updatedRecords);
    
    setFormData({
      type: '',
      amount: '',
      period: '',
      due_date: '',
      status: 'pending',
      description: ''
    });

    toast({
      title: "Success",
      description: "Tax record added successfully"
    });
  };

  const deleteTaxRecord = (id: string) => {
    if (!confirm('Are you sure you want to delete this tax record?')) return;
    
    const updatedRecords = taxRecords.filter(r => r.id !== id);
    saveTaxRecords(updatedRecords);

    toast({
      title: "Success",
      description: "Tax record deleted successfully"
    });
  };

  const totalTaxes = taxRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidTaxes = taxRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Taxes & Compliance</h3>
        <p className="text-muted-foreground">Manage tax obligations, rebates, and compliance documentation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Obligation</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalTaxes.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Taxes</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {paidTaxes.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs {(totalTaxes - paidTaxes).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Tax Record</CardTitle>
            <CardDescription>Record tax payments and obligations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tax Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                placeholder="Sales Tax, Income Tax, VAT, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">Tax Period</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                placeholder="Q1 2024, Jan 2024, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional notes"
              />
            </div>
            <Button onClick={addTaxRecord} className="w-full">Add Tax Record</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Checklist</CardTitle>
            <CardDescription>Essential compliance documents and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Sales Tax Return</p>
                  <p className="text-sm text-muted-foreground">Monthly filing required</p>
                </div>
                <Badge variant="outline">Due Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Income Tax Return</p>
                  <p className="text-sm text-muted-foreground">Annual filing</p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Export Documentation</p>
                  <p className="text-sm text-muted-foreground">Customs clearance</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>Rs {record.amount.toFixed(2)}</TableCell>
                  <TableCell>{record.due_date ? new Date(record.due_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTaxRecord(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {taxRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tax records added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
