import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  employee_code: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  status: string;
  notes?: string;
}

interface AttendanceCalendarProps {
  clientId: string;
  periodId: string;
}

export function AttendanceCalendar({ clientId, periodId }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, [clientId, currentDate]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, employee_code')
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    }
  };

  const loadAttendance = async () => {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance_tracking')
        .select('*')
        .eq('client_id', clientId)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const markAttendance = async (employeeId: string, date: string, status: string) => {
    try {
      setLoading(true);
      const attendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      
      const existingRecord = attendance.find(
        a => a.employee_id === employeeId && a.attendance_date === attendanceDate
      );

      if (existingRecord) {
        const { error } = await supabase
          .from('attendance_tracking')
          .update({ status })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance_tracking')
          .insert({
            client_id: clientId,
            employee_id: employeeId,
            attendance_date: attendanceDate,
            status,
            period_id: periodId
          });

        if (error) throw error;
      }

      await loadAttendance();
      toast({
        title: "Success",
        description: "Attendance marked successfully"
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (employeeId: string, date: number) => {
    const attendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const record = attendance.find(
      a => a.employee_id === employeeId && a.attendance_date === attendanceDate
    );
    return record?.status || 'not_marked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'leave': return 'bg-yellow-500';
      case 'half_day': return 'bg-blue-500';
      default: return 'bg-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Attendance Calendar</h3>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-32 text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-border">
          <thead>
            <tr className="bg-muted/30">
              <th className="border border-border p-2 text-left text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee
                </div>
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i + 1} className="border border-border p-1 text-center text-xs font-medium min-w-8">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="border-b border-border">
                <td className="border border-border p-2 font-medium text-sm">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{employee.employee_code}</div>
                  </div>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = i + 1;
                  const status = getAttendanceStatus(employee.id, date);
                  const isWeekend = new Date(year, month, date).getDay() === 0 || new Date(year, month, date).getDay() === 6;
                  
                  return (
                    <td key={date} className="border border-border p-1">
                      <Select
                        value={status === 'not_marked' ? '' : status}
                        onValueChange={(value) => markAttendance(employee.id, date.toString(), value)}
                        disabled={loading}
                      >
                        <SelectTrigger className={cn(
                          "w-full h-8 text-xs border-0",
                          isWeekend ? "bg-muted/50" : "",
                          getStatusColor(status)
                        )}>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">P</SelectItem>
                          <SelectItem value="absent">A</SelectItem>
                          <SelectItem value="leave">L</SelectItem>
                          <SelectItem value="half_day">H</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Present (P)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Absent (A)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Leave (L)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Half Day (H)</span>
        </div>
      </div>
    </Card>
  );
}