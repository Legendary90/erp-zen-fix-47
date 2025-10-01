import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Package,
  Clock
} from 'lucide-react';

export function Dashboard() {
  const { clientId } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingPayments: 0,
    absentEmployees: 0,
    lowStock: 0,
    overduePayments: 0
  });

  useEffect(() => {
    if (clientId) {
      loadDashboardStats();
    }
  }, [clientId]);

  const loadDashboardStats = async () => {
    if (!clientId) return;

    const today = new Date().toISOString().split('T')[0];

    // Today's sales
    const { data: salesData } = await supabase
      .from('sales_entries')
      .select('amount')
      .eq('client_id', clientId)
      .eq('date', today);

    const todaySales = salesData?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    // Pending payments
    const { data: receivablesData } = await supabase
      .from('invoices')
      .select('total_amount, paid_amount')
      .eq('client_id', clientId)
      .neq('status', 'paid');

    const pendingPayments = receivablesData?.reduce(
      (sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0
    ) || 0;

    // Absent employees today
    const { data: attendanceData } = await supabase
      .from('employee_attendance')
      .select('status')
      .eq('client_id', clientId)
      .eq('date', today)
      .eq('status', 'absent');

    const absentEmployees = attendanceData?.length || 0;

    // Overdue payments
    const { data: overdueData } = await supabase
      .from('invoices')
      .select('id')
      .eq('client_id', clientId)
      .lt('due_date', today)
      .neq('status', 'paid');

    const overduePayments = overdueData?.length || 0;

    setStats({
      todaySales,
      pendingPayments,
      absentEmployees,
      lowStock: 0,
      overduePayments
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time business metrics and alerts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {stats.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today's revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Rs {stats.pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding receivables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentEmployees}</div>
            <p className="text-xs text-muted-foreground">Employee absences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
            <p className="text-xs text-muted-foreground">Payments past due</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.overduePayments > 0 && (
              <div className="flex items-center gap-2 p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-950 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Overdue Payments Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.overduePayments} invoices are past their due date
                  </p>
                </div>
              </div>
            )}
            {stats.absentEmployees > 0 && (
              <div className="flex items-center gap-2 p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded">
                <Users className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Employee Absence Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.absentEmployees} employees marked absent today
                  </p>
                </div>
              </div>
            )}
            {stats.overduePayments === 0 && stats.absentEmployees === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active alerts at this time
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer transition">
              <p className="font-medium text-sm">Mark Attendance</p>
              <p className="text-xs text-muted-foreground">Update employee attendance for today</p>
            </div>
            <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer transition">
              <p className="font-medium text-sm">Record Sale</p>
              <p className="text-xs text-muted-foreground">Add new sales transaction</p>
            </div>
            <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer transition">
              <p className="font-medium text-sm">Create Invoice</p>
              <p className="text-xs text-muted-foreground">Generate new customer invoice</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
