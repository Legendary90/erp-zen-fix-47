import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ExcelTable } from '@/components/common/ExcelTable';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MonthlySummaryData {
  id: string;
  employee_name: string;
  employee_code: string;
  month_number: number;
  year: number;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  half_days: number;
  attendance_percentage: string;
}

interface MonthlySummaryProps {
  clientId?: string;
}

export function MonthlySummary({ clientId: propClientId }: MonthlySummaryProps) {
  const { clientId: authClientId } = useAuth();
  const clientId = propClientId || authClientId;
  const [summaryData, setSummaryData] = useState<MonthlySummaryData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthlySummary();
  }, [clientId, selectedMonth, selectedYear]);

  const loadMonthlySummary = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      
      // First get all employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, name, employee_code')
        .eq('client_id', clientId);

      if (empError) throw empError;

      // Then get monthly summary data
      const { data: summaries, error: summError } = await supabase
        .from('monthly_attendance_summary')
        .select('*')
        .eq('client_id', clientId)
        .eq('month_number', selectedMonth)
        .eq('year', selectedYear);

      if (summError) throw summError;

      // Combine the data
      const formattedData = summaries?.map(item => {
        const employee = employees?.find(emp => emp.id === item.employee_id);
        return {
          id: item.id,
          employee_name: employee?.name || 'Unknown',
          employee_code: employee?.employee_code || 'N/A',
          month_number: item.month_number,
          year: item.year,
          total_working_days: item.total_working_days || 0,
          present_days: item.present_days || 0,
          absent_days: item.absent_days || 0,
          leave_days: item.leave_days || 0,
          half_days: item.half_days || 0,
          attendance_percentage: (item.total_working_days || 0) > 0 
            ? `${(((item.present_days || 0) + ((item.half_days || 0) * 0.5)) / (item.total_working_days || 1) * 100).toFixed(1)}%`
            : '0%'
        };
      }) || [];

      setSummaryData(formattedData);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee Code', width: 'w-32' },
    { key: 'employee_name', label: 'Employee Name', width: 'w-48' },
    { key: 'total_working_days', label: 'Total Days', width: 'w-24' },
    { key: 'present_days', label: 'Present', width: 'w-24' },
    { key: 'absent_days', label: 'Absent', width: 'w-24' },
    { key: 'leave_days', label: 'Leave', width: 'w-24' },
    { key: 'half_days', label: 'Half Days', width: 'w-24' },
    { key: 'attendance_percentage', label: 'Attendance %', width: 'w-32' }
  ];

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Monthly Attendance Summary</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ExcelTable
        columns={columns}
        data={summaryData}
        showActions={false}
        className="border-0"
      />
    </Card>
  );
}