import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FinancialRecord {
  id: string;
  type: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  created_at: string;
}

export function FinancialRecordsSection() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'filed'
  });

  useEffect(() => {
    if (clientId) {
      loadRecords();
    }
  }, [clientId]);

  const loadRecords = () => {
    if (!clientId) return;
    const storedRecords = localStorage.getItem(`financial_records_${clientId}`);
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  };

  const saveRecords = (newRecords: FinancialRecord[]) => {
    if (clientId) {
      localStorage.setItem(`financial_records_${clientId}`, JSON.stringify(newRecords));
      setRecords(newRecords);
    }
  };

  const addRecord = () => {
    if (!formData.type || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      created_at: new Date().toISOString()
    };
    
    const updatedRecords = [newRecord, ...records];
    saveRecords(updatedRecords);
    
    setFormData({
      type: '',
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      status: 'filed'
    });

    toast({
      title: "Success",
      description: "Financial record added successfully"
    });
  };

  const deleteRecord = (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    const updatedRecords = records.filter(r => r.id !== id);
    saveRecords(updatedRecords);

    toast({
      title: "Success",
      description: "Financial record deleted successfully"
    });
  };

  const recordTypes = [
    'Income Receipt',
    'Expense Receipt',
    'Invoice',
    'Bill',
    'Bank Statement',
    'Payroll Record',
    'Tax Document'
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Income Receipt': 'bg-green-100 text-green-800',
      'Expense Receipt': 'bg-red-100 text-red-800',
      'Invoice': 'bg-blue-100 text-blue-800',
      'Bill': 'bg-orange-100 text-orange-800',
      'Bank Statement': 'bg-purple-100 text-purple-800',
      'Payroll Record': 'bg-indigo-100 text-indigo-800',
      'Tax Document': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Financial Records</h3>
        <p className="text-muted-foreground">Manage receipts, invoices, bank statements, and payroll records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {recordTypes.slice(0, 4).map((type) => {
          const count = records.filter(r => r.type === type).length;
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">documents</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Financial Record</CardTitle>
            <CardDescription>Record financial documents for compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Document description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (if applicable)</Label>
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
                placeholder="Operating, Marketing, etc."
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
            <Button onClick={addRecord} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>Upload documents and receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <p className="text-sm font-medium">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button variant="outline" className="mt-4">
                Select Files
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG, DOC, XLS (Max 10MB)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{record.category || '-'}</TableCell>
                  <TableCell>{record.amount ? `Rs ${record.amount.toFixed(2)}` : '-'}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="default">{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {records.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No financial records added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
