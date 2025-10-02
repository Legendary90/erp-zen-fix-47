import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Trash2 } from 'lucide-react';

interface FiscalYear {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: string;
  fiscal_year_id: string;
}

export function FiscalYearSection() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [yearFormData, setYearFormData] = useState({
    year_name: new Date().getFullYear().toString(),
    start_date: `${new Date().getFullYear()}-01-01`,
    end_date: `${new Date().getFullYear()}-12-31`
  });
  const [periodFormData, setPeriodFormData] = useState({
    period_name: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (clientId) {
      fetchFiscalYears();
    }
  }, [clientId]);

  useEffect(() => {
    if (selectedYear) {
      fetchPeriods();
    }
  }, [selectedYear]);

  const fetchFiscalYears = async () => {
    if (!clientId) return;
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });
    
    if (!error && data) {
      setFiscalYears(data);
      if (data.length > 0 && !selectedYear) {
        setSelectedYear(data[0].id);
      }
    }
  };

  const fetchPeriods = async () => {
    if (!clientId || !selectedYear) return;
    const { data, error } = await supabase
      .from('accounting_periods')
      .select('*')
      .eq('client_id', clientId)
      .eq('fiscal_year_id', selectedYear)
      .order('start_date');
    
    if (!error && data) {
      setPeriods(data);
    }
  };

  const addFiscalYear = async () => {
    if (!clientId || !yearFormData.year_name) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('fiscal_years').insert({
      client_id: clientId,
      ...yearFormData,
      status: 'active'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create fiscal year", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Fiscal year created" });
      setIsYearDialogOpen(false);
      fetchFiscalYears();
      setYearFormData({
        year_name: (parseInt(yearFormData.year_name) + 1).toString(),
        start_date: `${parseInt(yearFormData.year_name) + 1}-01-01`,
        end_date: `${parseInt(yearFormData.year_name) + 1}-12-31`
      });
    }
  };

  const addPeriod = async () => {
    if (!clientId || !selectedYear || !periodFormData.period_name) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('accounting_periods').insert({
      client_id: clientId,
      fiscal_year_id: selectedYear,
      ...periodFormData,
      period_type: 'monthly',
      status: 'active'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create period", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Period created" });
      setIsPeriodDialogOpen(false);
      fetchPeriods();
      setPeriodFormData({ period_name: '', start_date: '', end_date: '' });
    }
  };

  const toggleYearStatus = async (yearId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    const { error } = await supabase
      .from('fiscal_years')
      .update({ status: newStatus })
      .eq('id', yearId);

    if (!error) {
      toast({ title: "Success", description: `Year ${newStatus}` });
      fetchFiscalYears();
    }
  };

  const togglePeriodStatus = async (periodId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    const { error } = await supabase
      .from('accounting_periods')
      .update({ status: newStatus })
      .eq('id', periodId);

    if (!error) {
      toast({ title: "Success", description: `Period ${newStatus}` });
      fetchPeriods();
    }
  };

  const deleteFiscalYear = async (id: string) => {
    if (!confirm('Delete this fiscal year? All periods in it will be deleted.')) return;
    const { error } = await supabase.from('fiscal_years').delete().eq('id', id);
    if (!error) {
      toast({ title: "Success", description: "Fiscal year deleted" });
      fetchFiscalYears();
    }
  };

  const deletePeriod = async (id: string) => {
    if (!confirm('Delete this period?')) return;
    const { error } = await supabase.from('accounting_periods').delete().eq('id', id);
    if (!error) {
      toast({ title: "Success", description: "Period deleted" });
      fetchPeriods();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Fiscal Year & Period Management
        </h3>
        <p className="text-muted-foreground">Create fiscal years and periods to organize your accounting data</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fiscal Years</CardTitle>
              <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Year</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Fiscal Year</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Year Name *</Label><Input value={yearFormData.year_name} onChange={(e) => setYearFormData({...yearFormData, year_name: e.target.value})} /></div>
                    <div><Label>Start Date *</Label><Input type="date" value={yearFormData.start_date} onChange={(e) => setYearFormData({...yearFormData, start_date: e.target.value})} /></div>
                    <div><Label>End Date *</Label><Input type="date" value={yearFormData.end_date} onChange={(e) => setYearFormData({...yearFormData, end_date: e.target.value})} /></div>
                    <Button onClick={addFiscalYear} className="w-full">Create Fiscal Year</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fiscalYears.map((year) => (
                  <TableRow key={year.id} onClick={() => setSelectedYear(year.id)} className={selectedYear === year.id ? 'bg-muted' : ''}>
                    <TableCell>{year.year_name}</TableCell>
                    <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={year.status === 'active' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleYearStatus(year.id, year.status)}>
                        {year.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteFiscalYear(year.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Periods in {fiscalYears.find(y => y.id === selectedYear)?.year_name || 'Year'}</CardTitle>
              <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedYear}><Plus className="mr-2 h-4 w-4" />Add Period</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Period</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Period Name *</Label><Input value={periodFormData.period_name} onChange={(e) => setPeriodFormData({...periodFormData, period_name: e.target.value})} placeholder="e.g., January 2025" /></div>
                    <div><Label>Start Date *</Label><Input type="date" value={periodFormData.start_date} onChange={(e) => setPeriodFormData({...periodFormData, start_date: e.target.value})} /></div>
                    <div><Label>End Date *</Label><Input type="date" value={periodFormData.end_date} onChange={(e) => setPeriodFormData({...periodFormData, end_date: e.target.value})} /></div>
                    <Button onClick={addPeriod} className="w-full">Create Period</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell>{period.period_name}</TableCell>
                    <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={period.status === 'active' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => togglePeriodStatus(period.id, period.status)}>
                        {period.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => deletePeriod(period.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
