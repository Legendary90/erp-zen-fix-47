import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  notes: string;
  customer_id: string;
  period_id: string;
  customers: {
    customer_name: string;
    customer_code: string;
  };
  accounting_periods: {
    period_name: string;
  };
}

interface Customer {
  id: string;
  customer_code: string;
  customer_name: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function AccountsReceivableSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    if (!clientId) return;

    // Fetch invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(customer_name, customer_code),
        accounting_periods(period_name)
      `)
      .eq('client_id', clientId)
      .order('invoice_date', { ascending: false });

    if (invoicesError) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } else {
      setInvoices(invoicesData || []);
    }

    // Fetch customers
    const { data: customersData } = await supabase
      .from('customers')
      .select('id, customer_code, customer_name')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('customer_name');

    setCustomers(customersData || []);

    // Fetch periods
    const { data: periodsData } = await supabase
      .from('accounting_periods')
      .select('id, period_name, status')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });

    setPeriods(periodsData || []);
    const activePeriod = periodsData?.find(p => p.status === 'active');
    if (activePeriod) {
      setSelectedPeriod(activePeriod.id);
    }
  };

  const createInvoice = async () => {
    if (!invoiceNumber || !selectedCustomer || !selectedPeriod || !invoiceDate || !dueDate || !subtotal || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const subtotalAmount = parseFloat(subtotal);
    const taxAmountValue = parseFloat(taxAmount) || 0;
    const totalAmount = subtotalAmount + taxAmountValue;

    const { error } = await supabase
      .from('invoices')
      .insert([{
        client_id: clientId,
        period_id: selectedPeriod,
        customer_id: selectedCustomer,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal: subtotalAmount,
        tax_amount: taxAmountValue,
        total_amount: totalAmount,
        paid_amount: 0,
        status: 'draft',
        notes: notes || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchData();
    }
  };

  const resetForm = () => {
    setInvoiceNumber('');
    setSelectedCustomer('');
    setInvoiceDate('');
    setDueDate('');
    setSubtotal('');
    setTaxAmount('');
    setNotes('');
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

  const overdueInvoices = invoices.filter(inv => {
    const dueDate = new Date(inv.due_date);
    const today = new Date();
    return dueDate < today && inv.status !== 'paid' && inv.status !== 'cancelled';
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Accounts Receivable</h3>
          <p className="text-muted-foreground">Manage customer invoices and receivables</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.customer_code} - {customer.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax Amount</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="0.00"
                  />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="notes">Notes</Label>
                 <Textarea
                   id="notes"
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   placeholder="Additional notes..."
                 />
               </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createInvoice}>Create Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(inv => inv.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueInvoices.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.customers.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{invoice.customers.customer_code}</div>
                  </TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>${invoice.paid_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                        >
                          Send
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}