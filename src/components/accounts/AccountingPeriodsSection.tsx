import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Lock, Unlock, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AccountingPeriod {
  id: string;
  period_name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  client_id: string;
}

export function AccountingPeriodsSection() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [periodName, setPeriodName] = useState('');
  const [periodType, setPeriodType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, [clientId]);

  const fetchPeriods = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('accounting_periods')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accounting periods",
        variant: "destructive",
      });
    } else {
      setPeriods(data || []);
    }
  };

  const createPeriod = async () => {
    if (!periodName || !startDate || !endDate || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Close any existing active periods
    await supabase
      .from('accounting_periods')
      .update({ status: 'closed' })
      .eq('client_id', clientId)
      .eq('status', 'active');

    const { error } = await supabase
      .from('accounting_periods')
      .insert([{
        client_id: clientId,
        period_name: periodName,
        period_type: periodType,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create accounting period",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Accounting period created successfully",
      });
      setPeriodName('');
      setStartDate('');
      setEndDate('');
      setIsDialogOpen(false);
      fetchPeriods();
    }
  };

  const togglePeriodStatus = async (periodId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    
    if (newStatus === 'active') {
      // Close all other active periods first
      await supabase
        .from('accounting_periods')
        .update({ status: 'closed' })
        .eq('client_id', clientId)
        .eq('status', 'active');
    }

    const { error } = await supabase
      .from('accounting_periods')
      .update({ status: newStatus })
      .eq('id', periodId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update period status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Period ${newStatus === 'active' ? 'activated' : 'closed'} successfully`,
      });
      fetchPeriods();
    }
  };

  const deletePeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to delete this accounting period? This will also delete all related data.')) return;

    const { error } = await supabase
      .from('accounting_periods')
      .delete()
      .eq('id', periodId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete period",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Period deleted successfully",
      });
      fetchPeriods();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'locked':
        return <Badge variant="destructive">Locked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Accounting Periods</h3>
          <p className="text-muted-foreground">Manage your accounting periods and fiscal cycles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Period
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Accounting Period</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period-name">Period Name</Label>
                <Input
                  id="period-name"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="e.g., January 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-type">Period Type</Label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPeriod}>Create Period</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Period</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {periods.find(p => p.status === 'active')?.period_name || 'None'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Periods</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.filter(p => p.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium">{period.period_name}</TableCell>
                  <TableCell className="capitalize">{period.period_type}</TableCell>
                  <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(period.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePeriodStatus(period.id, period.status)}
                        disabled={period.status === 'locked'}
                      >
                        {period.status === 'active' ? 'Close' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePeriod(period.id)}
                        className="text-destructive hover:text-destructive"
                        disabled={period.status === 'active'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {periods.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No accounting periods found. Create your first period to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}