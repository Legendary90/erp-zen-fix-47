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
import { Plus, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  notes: string;
  vendor_id: string;
  period_id: string;
  vendors: {
    vendor_name: string;
    vendor_code: string;
  };
  accounting_periods: {
    period_name: string;
  };
}

interface Vendor {
  id: string;
  vendor_code: string;
  vendor_name: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  status: string;
}

export function AccountsPayableSection() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [billDate, setBillDate] = useState('');
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

    // Fetch bills
    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .select(`
        *,
        vendors(vendor_name, vendor_code),
        accounting_periods(period_name)
      `)
      .eq('client_id', clientId)
      .order('bill_date', { ascending: false });

    if (billsError) {
      toast({
        title: "Error",
        description: "Failed to fetch bills",
        variant: "destructive",
      });
    } else {
      setBills(billsData || []);
    }

    // Fetch vendors
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, vendor_code, vendor_name')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('vendor_name');

    setVendors(vendorsData || []);

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

  const createBill = async () => {
    if (!billNumber || !selectedVendor || !selectedPeriod || !billDate || !dueDate || !subtotal || !clientId) {
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
      .from('bills')
      .insert([{
        client_id: clientId,
        period_id: selectedPeriod,
        vendor_id: selectedVendor,
        bill_number: billNumber,
        bill_date: billDate,
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
        description: "Failed to create bill",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchData();
    }
  };

  const resetForm = () => {
    setBillNumber('');
    setSelectedVendor('');
    setBillDate('');
    setDueDate('');
    setSubtotal('');
    setTaxAmount('');
    setNotes('');
  };

  const updateBillStatus = async (billId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bills')
      .update({ status: newStatus })
      .eq('id', billId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Bill status updated successfully",
      });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalOutstanding = bills
    .filter(bill => bill.status !== 'paid')
    .reduce((sum, bill) => sum + (bill.total_amount - bill.paid_amount), 0);

  const overdueBills = bills.filter(bill => {
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    return dueDate < today && bill.status !== 'paid';
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Accounts Payable</h3>
          <p className="text-muted-foreground">Manage vendor bills and payables</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-number">Bill Number</Label>
                  <Input
                    id="bill-number"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder="BILL-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.vendor_code} - {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-date">Bill Date</Label>
                  <Input
                    id="bill-date"
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
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
              <Button onClick={createBill}>Create Bill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bills.filter(bill => bill.status === 'paid').length}
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
              {overdueBills.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.bill_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{bill.vendors.vendor_name}</div>
                    <div className="text-sm text-muted-foreground">{bill.vendors.vendor_code}</div>
                  </TableCell>
                  <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>Rs {bill.total_amount.toFixed(2)}</TableCell>
                  <TableCell>Rs {bill.paid_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {bill.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBillStatus(bill.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                      {bill.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBillStatus(bill.id, 'paid')}
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
          {bills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No bills found. Create your first bill to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}