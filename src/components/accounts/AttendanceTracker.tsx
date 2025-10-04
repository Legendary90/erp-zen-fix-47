import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  employee_code: string;
  department: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'half_day';
  notes?: string;
  client_id: string;
  period_id?: string;
}

interface AttendanceTrackerProps {
  employees: Employee[];
  clientId: string;
  onAttendanceMarked?: () => void;
}

export function AttendanceTracker({ employees, clientId, onAttendanceMarked }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'leave' | 'half_day'>('present');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [clientId, selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', dateStr);

      if (error) throw error;
      setAttendance((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existingRecord = attendance.find(r => r.employee_id === selectedEmployee.id);

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('employee_attendance')
          .update({
            status: attendanceStatus,
            notes: notes.trim() || null,
          })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Create new record - get active period first
        const { data: periodData } = await supabase
          .rpc('get_active_period', { p_client_id: clientId });
        
        if (!periodData) {
          toast({
            title: "Error",
            description: "No active accounting period found. Please create one first.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('employee_attendance')
          .insert({
            employee_id: selectedEmployee.id,
            client_id: clientId,
            date: dateStr,
            status: attendanceStatus,
            notes: notes.trim() || null,
            period_id: periodData,
          });

        if (error) throw error;
      }

      await loadAttendanceData();
      
      toast({
        title: "Success",
        description: `Attendance marked for ${selectedEmployee.name}`,
      });

      // Notify parent component to refresh
      onAttendanceMarked?.();

      setShowDialog(false);
      setNotes('');
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendance.find(r => r.employee_id === employeeId);
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-600" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'half_day':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'absent':
        return 'destructive';
      case 'leave':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const unmarkEmployees = employees.filter(emp => !getEmployeeAttendance(emp.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Attendance Tracker
        </CardTitle>
        <div className="flex items-center justify-between">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border rounded-md"
          />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button 
                disabled={employees.length === 0}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance for {format(selectedDate, 'MMM dd, yyyy')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Employee</Label>
                  <Select onValueChange={(value) => {
                    const employee = employees.find(emp => emp.id === value);
                    setSelectedEmployee(employee || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.employee_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                    <Select value={attendanceStatus} onValueChange={(value: 'present' | 'absent' | 'leave' | 'half_day') => setAttendanceStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="leave">On Leave</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={markAttendance} 
                    disabled={!selectedEmployee || loading}
                  >
                    {loading ? 'Saving...' : 'Mark Attendance'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Attendance for {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </div>
          
          <div className="space-y-2">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Add employees first to track attendance.
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading attendance data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-left p-3 font-medium">Code</th>
                      <th className="text-left p-3 font-medium">Department</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => {
                      const attendanceRecord = getEmployeeAttendance(employee.id);
                      return (
                        <tr key={employee.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(attendanceRecord?.status)}
                              <span className="font-medium">{employee.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {employee.employee_code}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {employee.department || 'No Dept'}
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusBadgeVariant(attendanceRecord?.status)}>
                              {attendanceRecord?.status ? attendanceRecord.status.replace('_', ' ') : 'Not Marked'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {attendanceRecord?.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}