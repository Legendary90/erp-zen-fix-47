import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Calendar,
  UserCheck,
  TrendingUp,
  Package,
  FileText
} from 'lucide-react';

export function UnifiedDataView() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [salesEntries, setSalesEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [purchaseEntries, setPurchaseEntries] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const [
        employeesRes,
        salesRes,
        expensesRes,
        purchasesRes,
        attendanceRes,
        customersRes,
        vendorsRes,
        periodsRes
      ] = await Promise.all([
        supabase.from('employees').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('sales_entries').select('*').eq('client_id', clientId).order('date', { ascending: false }),
        supabase.from('expense_entries').select('*').eq('client_id', clientId).order('date', { ascending: false }),
        supabase.from('purchase_entries').select('*').eq('client_id', clientId).order('date', { ascending: false }),
        supabase.from('employee_attendance').select('*').eq('client_id', clientId).order('date', { ascending: false }),
        supabase.from('customers').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('vendors').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('accounting_periods').select('*').eq('client_id', clientId).order('start_date', { ascending: false })
      ]);

      setEmployees(employeesRes.data || []);
      setSalesEntries(salesRes.data || []);
      setExpenseEntries(expensesRes.data || []);
      setPurchaseEntries(purchasesRes.data || []);
      setAttendance(attendanceRes.data || []);
      setCustomers(customersRes.data || []);
      setVendors(vendorsRes.data || []);
      setAccountingPeriods(periodsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  // Employee operations
  const employeeColumns = [
    { key: 'employee_code', label: 'Code', type: 'text' as const, required: true, width: 'w-32' },
    { key: 'name', label: 'Name', type: 'text' as const, required: true, width: 'w-48' },
    { key: 'position', label: 'Position', type: 'text' as const, required: true, width: 'w-40' },
    { key: 'department', label: 'Department', type: 'text' as const, width: 'w-32' },
    { key: 'email', label: 'Email', type: 'text' as const, width: 'w-48' },
    { key: 'phone', label: 'Phone', type: 'text' as const, width: 'w-32' },
    { key: 'hire_date', label: 'Hire Date', type: 'date' as const, width: 'w-32' },
    { key: 'salary', label: 'Salary', type: 'number' as const, width: 'w-32' },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['active', 'on_leave', 'inactive'], width: 'w-24' }
  ];

  const handleEmployeeAdd = async (data: any) => {
    const { error } = await supabase.from('employees').insert([{
      ...data,
      client_id: clientId,
      salary: data.salary ? parseFloat(data.salary) : null,
      attendance_days: 0,
      leave_days: 0
    }]);
    if (error) throw error;
    fetchData();
  };

  const handleEmployeeEdit = async (id: string, data: any) => {
    const { error } = await supabase.from('employees').update({
      ...data,
      salary: data.salary ? parseFloat(data.salary) : null
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const handleEmployeeDelete = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // Sales operations
  const salesColumns = [
    { key: 'date', label: 'Date', type: 'date' as const, required: true, width: 'w-32' },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true, width: 'w-64' },
    { key: 'category', label: 'Category', type: 'text' as const, width: 'w-32' },
    { key: 'amount', label: 'Amount', type: 'number' as const, required: true, width: 'w-32' },
    { key: 'payment_status', label: 'Status', type: 'select' as const, options: ['paid', 'pending', 'overdue'], width: 'w-24' }
  ];

  const handleSalesAdd = async (data: any) => {
    const { error } = await supabase.from('sales_entries').insert([{
      ...data,
      client_id: clientId,
      amount: parseFloat(data.amount)
    }]);
    if (error) throw error;
    fetchData();
  };

  const handleSalesEdit = async (id: string, data: any) => {
    const { error } = await supabase.from('sales_entries').update({
      ...data,
      amount: parseFloat(data.amount)
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const handleSalesDelete = async (id: string) => {
    const { error } = await supabase.from('sales_entries').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // Expense operations
  const expenseColumns = [
    { key: 'date', label: 'Date', type: 'date' as const, required: true, width: 'w-32' },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true, width: 'w-64' },
    { key: 'category', label: 'Category', type: 'text' as const, width: 'w-32' },
    { key: 'amount', label: 'Amount', type: 'number' as const, required: true, width: 'w-32' }
  ];

  const handleExpenseAdd = async (data: any) => {
    const { error } = await supabase.from('expense_entries').insert([{
      ...data,
      client_id: clientId,
      amount: parseFloat(data.amount)
    }]);
    if (error) throw error;
    fetchData();
  };

  const handleExpenseEdit = async (id: string, data: any) => {
    const { error } = await supabase.from('expense_entries').update({
      ...data,
      amount: parseFloat(data.amount)
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const handleExpenseDelete = async (id: string) => {
    const { error } = await supabase.from('expense_entries').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // Customer operations
  const customerColumns = [
    { key: 'customer_code', label: 'Code', type: 'text' as const, required: true, width: 'w-32' },
    { key: 'customer_name', label: 'Name', type: 'text' as const, required: true, width: 'w-48' },
    { key: 'contact_person', label: 'Contact', type: 'text' as const, width: 'w-40' },
    { key: 'email', label: 'Email', type: 'text' as const, width: 'w-48' },
    { key: 'phone', label: 'Phone', type: 'text' as const, width: 'w-32' },
    { key: 'address', label: 'Address', type: 'textarea' as const, width: 'w-64' },
    { key: 'payment_terms', label: 'Payment Terms', type: 'number' as const, width: 'w-24' },
    { key: 'credit_limit', label: 'Credit Limit', type: 'number' as const, width: 'w-32' }
  ];

  const handleCustomerAdd = async (data: any) => {
    const { error } = await supabase.from('customers').insert([{
      ...data,
      client_id: clientId,
      payment_terms: data.payment_terms ? parseInt(data.payment_terms) : 30,
      credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : 0
    }]);
    if (error) throw error;
    fetchData();
  };

  const handleCustomerEdit = async (id: string, data: any) => {
    const { error } = await supabase.from('customers').update({
      ...data,
      payment_terms: data.payment_terms ? parseInt(data.payment_terms) : 30,
      credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : 0
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const handleCustomerDelete = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // Attendance operations
  const attendanceColumns = [
    { key: 'date', label: 'Date', type: 'date' as const, required: true, width: 'w-32' },
    { key: 'employee_id', label: 'Employee ID', type: 'text' as const, required: true, width: 'w-48' },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['present', 'absent', 'leave', 'half_day'], width: 'w-24' },
    { key: 'notes', label: 'Notes', type: 'textarea' as const, width: 'w-64' }
  ];

  const handleAttendanceAdd = async (data: any) => {
    const { error } = await supabase.from('employee_attendance').insert([{
      ...data,
      client_id: clientId
    }]);
    if (error) throw error;
    fetchData();
  };

  const handleAttendanceEdit = async (id: string, data: any) => {
    const { error } = await supabase.from('employee_attendance').update(data).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const handleAttendanceDelete = async (id: string) => {
    const { error } = await supabase.from('employee_attendance').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Management</h2>
          <p className="text-muted-foreground">
            Excel-like interface for managing all your business data
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <DataTable
            title="Employee Management"
            data={employees}
            columns={employeeColumns}
            onAdd={handleEmployeeAdd}
            onEdit={handleEmployeeEdit}
            onDelete={handleEmployeeDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="sales">
          <DataTable
            title="Sales Entries"
            data={salesEntries}
            columns={salesColumns}
            onAdd={handleSalesAdd}
            onEdit={handleSalesEdit}
            onDelete={handleSalesDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <DataTable
            title="Expense Entries"
            data={expenseEntries}
            columns={expenseColumns}
            onAdd={handleExpenseAdd}
            onEdit={handleExpenseEdit}
            onDelete={handleExpenseDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="customers">
          <DataTable
            title="Customer Management"
            data={customers}
            columns={customerColumns}
            onAdd={handleCustomerAdd}
            onEdit={handleCustomerEdit}
            onDelete={handleCustomerDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <DataTable
            title="Employee Attendance"
            data={attendance}
            columns={attendanceColumns}
            onAdd={handleAttendanceAdd}
            onEdit={handleAttendanceEdit}
            onDelete={handleAttendanceDelete}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}