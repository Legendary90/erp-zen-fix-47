import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FinancialData {
  account_code: string;
  account_name: string;
  account_type: string;
  total_debits: number;
  total_credits: number;
  balance: number;
}

interface PeriodData {
  id: string;
  period_name: string;
  status: string;
}

export function FinancialReportsSection() {
  const [reportType, setReportType] = useState('balance-sheet');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState<PeriodData[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(false);
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, [clientId]);

  useEffect(() => {
    if (selectedPeriod) {
      generateReport();
    }
  }, [selectedPeriod, reportType]);

  const fetchPeriods = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('accounting_periods')
      .select('id, period_name, status')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch periods",
        variant: "destructive",
      });
    } else {
      setPeriods(data || []);
      // Auto-select active period
      const activePeriod = data?.find(p => p.status === 'active');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    }
  };

  const generateReport = async () => {
    if (!selectedPeriod || !clientId) return;

    setLoading(true);
    try {
      // Fetch accounts with their GL balances
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          id, account_code, account_name, account_type,
          general_ledger!inner(
            debit_amount,
            credit_amount
          )
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .eq('general_ledger.period_id', selectedPeriod);

      if (accountsError) {
        throw accountsError;
      }

      // Process the data to calculate balances
      const processedData: FinancialData[] = [];
      const accountMap = new Map();

      // Initialize accounts
      const { data: allAccounts } = await supabase
        .from('accounts')
        .select('id, account_code, account_name, account_type')
        .eq('client_id', clientId)
        .eq('is_active', true);

      allAccounts?.forEach(account => {
        accountMap.set(account.id, {
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          total_debits: 0,
          total_credits: 0,
          balance: 0
        });
      });

      // Calculate totals from GL entries
      const { data: glEntries } = await supabase
        .from('general_ledger')
        .select('account_id, debit_amount, credit_amount')
        .eq('client_id', clientId)
        .eq('period_id', selectedPeriod);

      glEntries?.forEach(entry => {
        const account = accountMap.get(entry.account_id);
        if (account) {
          account.total_debits += entry.debit_amount;
          account.total_credits += entry.credit_amount;
          
          // Calculate balance based on account type
          if (['asset', 'expense'].includes(account.account_type)) {
            account.balance = account.total_debits - account.total_credits;
          } else {
            account.balance = account.total_credits - account.total_debits;
          }
        }
      });

      setFinancialData(Array.from(accountMap.values()));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    switch (reportType) {
      case 'balance-sheet':
        return financialData.filter(item => 
          ['asset', 'liability', 'equity'].includes(item.account_type)
        );
      case 'income-statement':
        return financialData.filter(item => 
          ['revenue', 'expense'].includes(item.account_type)
        );
      case 'trial-balance':
        return financialData;
      default:
        return financialData;
    }
  };

  const getTotalsByType = (type: string) => {
    return financialData
      .filter(item => item.account_type === type)
      .reduce((sum, item) => sum + item.balance, 0);
  };

  const getReportSummary = () => {
    switch (reportType) {
      case 'balance-sheet':
        const totalAssets = getTotalsByType('asset');
        const totalLiabilities = getTotalsByType('liability');
        const totalEquity = getTotalsByType('equity');
        return {
          totalAssets,
          totalLiabilities,
          totalEquity,
          balanceCheck: totalAssets - (totalLiabilities + totalEquity)
        };
      case 'income-statement':
        const totalRevenue = getTotalsByType('revenue');
        const totalExpenses = getTotalsByType('expense');
        return {
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses
        };
      default:
        return null;
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Account Code', 'Account Name', 'Type', 'Debits', 'Credits', 'Balance'],
      ...getFilteredData().map(item => [
        item.account_code,
        item.account_name,
        item.account_type,
        item.total_debits.toFixed(2),
        item.total_credits.toFixed(2),
        item.balance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summary = getReportSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Financial Reports</h3>
          <p className="text-muted-foreground">Generate comprehensive financial statements and reports</p>
        </div>
        <Button onClick={exportReport} disabled={!financialData.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
              <SelectItem value="income-statement">Income Statement</SelectItem>
              <SelectItem value="trial-balance">Trial Balance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>
                  {period.period_name} ({period.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          {reportType === 'balance-sheet' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalAssets.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalLiabilities.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalEquity.toFixed(2)}</div>
                </CardContent>
              </Card>
            </>
          )}
          {reportType === 'income-statement' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <BarChart3 className={`h-4 w-4 ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary.netIncome.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {reportType === 'balance-sheet' && 'Balance Sheet'}
            {reportType === 'income-statement' && 'Income Statement'}
            {reportType === 'trial-balance' && 'Trial Balance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  {reportType === 'trial-balance' && (
                    <>
                      <TableHead>Debits</TableHead>
                      <TableHead>Credits</TableHead>
                    </>
                  )}
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{item.account_code}</TableCell>
                    <TableCell className="font-medium">{item.account_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.account_type}
                      </Badge>
                    </TableCell>
                    {reportType === 'trial-balance' && (
                      <>
                        <TableCell>${item.total_debits.toFixed(2)}</TableCell>
                        <TableCell>${item.total_credits.toFixed(2)}</TableCell>
                      </>
                    )}
                    <TableCell className={`font-medium ${item.balance < 0 ? 'text-red-600' : ''}`}>
                      ${Math.abs(item.balance).toFixed(2)}
                      {item.balance < 0 && ' (CR)'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && getFilteredData().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data available for the selected period and report type.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}