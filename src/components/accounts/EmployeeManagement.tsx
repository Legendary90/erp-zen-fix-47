import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, Calendar, BarChart3, Eye } from 'lucide-react';

interface Employee {
  id: string;
  employee_code: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  status: string;
  hire_date: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: string;
  notes: string;
}

interface MonthlySummary {
  employee_id: string;
  employee_name: string;
  present_days: number;
  absent_days: number;
  leave_days: number;
  total_days: number;
}

export function EmployeeManagement() {
  const { clientId } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0]
  });
  const [attendanceFormData, setAttendanceFormData] = useState({
    employee_id: '',
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const fetchData = async () => {
    await Promise.all([
      fetchEmployees(),
      fetchPeriods(),
      fetchAttendance(),
      fetchMonthlySummary()
    ]);
  };

  const fetchEmployees = async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('client_id', clientId)
      .order('employee_code');
    setEmployees(data || []);
  };

  const fetchPeriods = async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from('accounting_periods')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });
    setPeriods(data || []);
    const active = data?.find(p => p.status === 'active');
    if (active) setSelectedPeriod(active.id);
  };

  const fetchAttendance = async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from('employee_attendance')
      .select('*')
      .eq('client_id', clientId)
      .eq('date', selectedDate);
    setAttendance(data || []);
  };

  const fetchMonthlySummary = async () => {
    if (!clientId || !selectedPeriod) return;
    
    const { data: attendanceData } = await supabase
      .from('employee_attendance')
      .select('*, employees(name)')
      .eq('client_id', clientId)
      .eq('period_id', selectedPeriod);

    const summary: Record<string, MonthlySummary> = {};
    
    attendanceData?.forEach((record: any) => {
      const empId = record.employee_id;
      if (!summary[empId]) {
        summary[empId] = {
          employee_id: empId,
          employee_name: record.employees?.name || 'Unknown',
          present_days: 0,
          absent_days: 0,
          leave_days: 0,
          total_days: 0
        };
      }
      summary[empId].total_days++;
      if (record.status === 'present') summary[empId].present_days++;
      if (record.status === 'absent') summary[empId].absent_days++;
      if (record.status === 'leave') summary[empId].leave_days++;
    });

    setMonthlySummary(Object.values(summary));
  };

  const addEmployee = async () => {
    if (!clientId || !formData.name || !formData.employee_code) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('employees').insert({
      client_id: clientId,
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      status: 'active'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add employee", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Employee added" });
      setIsAddDialogOpen(false);
      fetchEmployees();
      setFormData({
        employee_code: '',
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        salary: '',
        hire_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Employee deleted" });
      fetchEmployees();
    }
  };

  const markAttendance = async () => {
    if (!clientId || !attendanceFormData.employee_id || !selectedPeriod) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }

    const existing = attendance.find(a => a.employee_id === attendanceFormData.employee_id);

    if (existing) {
      const { error } = await supabase
        .from('employee_attendance')
        .update({
          status: attendanceFormData.status,
          notes: attendanceFormData.notes
        })
        .eq('id', existing.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Attendance updated" });
      }
    } else {
      const { error } = await supabase.from('employee_attendance').insert({
        client_id: clientId,
        employee_id: attendanceFormData.employee_id,
        date: selectedDate,
        status: attendanceFormData.status,
        notes: attendanceFormData.notes,
        period_id: selectedPeriod
      });

      if (error) {
        toast({ title: "Error", description: "Failed to mark attendance", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Attendance marked" });
      }
    }

    setIsAttendanceDialogOpen(false);
    fetchAttendance();
    fetchMonthlySummary();
    setAttendanceFormData({ employee_id: '', status: 'present', notes: '' });
  };

  const viewEmployeeDetails = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Employee Management
        </h3>
        <p className="text-muted-foreground">Comprehensive HR and attendance tracking system</p>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Employee Records</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employee Records</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Employee Code *</Label><Input value={formData.employee_code} onChange={(e) => setFormData({...formData, employee_code: e.target.value})} /></div>
                      <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                      <div><Label>Position</Label><Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} /></div>
                      <div><Label>Department</Label><Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} /></div>
                      <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                      <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                      <div><Label>Salary</Label><Input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} /></div>
                      <div><Label>Hire Date</Label><Input type="date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} /></div>
                      <Button onClick={addEmployee} className="w-full">Add Employee</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.employee_code}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>Rs {emp.salary?.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>{emp.status}</Badge></TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewEmployeeDetails(emp)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteEmployee(emp.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Daily Attendance</CardTitle>
                  <Input type="date" value={selectedDate} onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchAttendance();
                  }} className="w-48" />
                </div>
                <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Mark Attendance</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Attendance for {selectedDate}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Employee *</Label>
                        <Select value={attendanceFormData.employee_id} onValueChange={(value) => setAttendanceFormData({...attendanceFormData, employee_id: value})}>
                          <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>{emp.employee_code} - {emp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status *</Label>
                        <Select value={attendanceFormData.status} onValueChange={(value) => setAttendanceFormData({...attendanceFormData, status: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input value={attendanceFormData.notes} onChange={(e) => setAttendanceFormData({...attendanceFormData, notes: e.target.value})} placeholder="Optional notes" />
                      </div>
                      <Button onClick={markAttendance} className="w-full">Mark Attendance</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => {
                    const emp = employees.find(e => e.id === record.employee_id);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{emp?.employee_code} - {emp?.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            record.status === 'present' ? 'default' :
                            record.status === 'absent' ? 'destructive' : 'secondary'
                          }>{record.status}</Badge>
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Leave</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummary.map((summary) => (
                    <TableRow key={summary.employee_id}>
                      <TableCell>{summary.employee_name}</TableCell>
                      <TableCell>{summary.total_days}</TableCell>
                      <TableCell className="text-green-600">{summary.present_days}</TableCell>
                      <TableCell className="text-red-600">{summary.absent_days}</TableCell>
                      <TableCell className="text-yellow-600">{summary.leave_days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee Details: {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Employee Code:</strong> {selectedEmployee.employee_code}</div>
                <div><strong>Position:</strong> {selectedEmployee.position}</div>
                <div><strong>Department:</strong> {selectedEmployee.department}</div>
                <div><strong>Email:</strong> {selectedEmployee.email}</div>
                <div><strong>Phone:</strong> {selectedEmployee.phone}</div>
                <div><strong>Salary:</strong> Rs {selectedEmployee.salary?.toLocaleString()}</div>
                <div><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</div>
                <div><strong>Status:</strong> <Badge>{selectedEmployee.status}</Badge></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
