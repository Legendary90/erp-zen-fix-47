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
import { format } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  employee_code: string;
  department: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'on_leave';
  notes?: string;
}

interface EmployeeAttendance {
  employeeId: string;
  month: string;
  year: string;
  records: AttendanceRecord[];
}

interface AttendanceTrackerProps {
  employees: Employee[];
  clientId: string;
}

export function AttendanceTracker({ employees, clientId }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState<EmployeeAttendance[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'on_leave'>('present');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAttendanceData();
  }, [clientId]);

  const loadAttendanceData = () => {
    const stored = localStorage.getItem(`attendance_${clientId}`);
    if (stored) {
      setAttendance(JSON.parse(stored));
    }
  };

  const saveAttendanceData = (newAttendance: EmployeeAttendance[]) => {
    setAttendance(newAttendance);
    localStorage.setItem(`attendance_${clientId}`, JSON.stringify(newAttendance));
  };

  const markAttendance = () => {
    if (!selectedEmployee) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const month = format(selectedDate, 'MM');
    const year = format(selectedDate, 'yyyy');

    const newAttendance = [...attendance];
    let employeeAttendance = newAttendance.find(a => 
      a.employeeId === selectedEmployee.id && a.month === month && a.year === year
    );

    if (!employeeAttendance) {
      employeeAttendance = {
        employeeId: selectedEmployee.id,
        month,
        year,
        records: []
      };
      newAttendance.push(employeeAttendance);
    }

    const existingRecordIndex = employeeAttendance.records.findIndex(r => r.date === dateStr);
    const newRecord: AttendanceRecord = { 
      date: dateStr, 
      status: attendanceStatus, 
      notes: notes.trim() || undefined 
    };

    if (existingRecordIndex >= 0) {
      employeeAttendance.records[existingRecordIndex] = newRecord;
    } else {
      employeeAttendance.records.push(newRecord);
    }

    saveAttendanceData(newAttendance);
    
    toast({
      title: "Success",
      description: `Attendance marked for ${selectedEmployee.name}`,
    });

    setShowDialog(false);
    setNotes('');
    setSelectedEmployee(null);
  };

  const getEmployeeAttendance = (employeeId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const month = format(date, 'MM');
    const year = format(date, 'yyyy');
    
    const employeeAttendance = attendance.find(a => 
      a.employeeId === employeeId && a.month === month && a.year === year
    );
    
    return employeeAttendance?.records.find(r => r.date === dateStr);
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-600" />;
      case 'on_leave':
        return <Clock className="h-4 w-4 text-yellow-600" />;
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
      case 'on_leave':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const unmarkEmployees = employees.filter(emp => !getEmployeeAttendance(emp.id, selectedDate));

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
                  <Select value={attendanceStatus} onValueChange={(value: 'present' | 'absent' | 'on_leave') => setAttendanceStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
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
                    disabled={!selectedEmployee}
                  >
                    Mark Attendance
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
            ) : (
              employees.map(employee => {
                const attendanceRecord = getEmployeeAttendance(employee.id, selectedDate);
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attendanceRecord?.status)}
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">({employee.employee_code})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{employee.department || 'No Dept'}</span>
                      <Badge variant={getStatusBadgeVariant(attendanceRecord?.status)}>
                        {attendanceRecord?.status ? attendanceRecord.status.replace('_', ' ') : 'Not Marked'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}