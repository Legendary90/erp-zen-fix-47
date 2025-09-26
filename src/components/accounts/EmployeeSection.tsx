import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Trash2, Edit, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTracker } from './AttendanceTracker';
import { MonthlySummary } from '@/components/attendance/MonthlySummary';
import { format } from 'date-fns';

interface Employee {
  id: string;
  employee_code: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  hire_date: string;
  status: string;
  attendance_days: number;
  leave_days: number;
  salary: number;
  department: string;
  created_at: string;
}

export function EmployeeSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    position: '',
    email: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    attendance_days: '0',
    leave_days: '0',
    salary: '',
    department: ''
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [clientId]);

  const fetchEmployees = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } else {
      setEmployees(data || []);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_code: '',
      name: '',
      position: '',
      email: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      attendance_days: '0',
      leave_days: '0',
      salary: '',
      department: ''
    });
    setEditingEmployee(null);
  };

  const createEmployee = async () => {
    if (!formData.employee_code || !formData.name || !formData.position || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('employees')
      .insert([{
        client_id: clientId,
        employee_code: formData.employee_code,
        name: formData.name,
        position: formData.position,
        email: formData.email || null,
        phone: formData.phone || null,
        hire_date: formData.hire_date,
        status: formData.status,
        attendance_days: parseInt(formData.attendance_days) || 0,
        leave_days: parseInt(formData.leave_days) || 0,
        salary: parseFloat(formData.salary) || null,
        department: formData.department || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchEmployees();
    }
  };

  const updateEmployee = async () => {
    if (!editingEmployee || !formData.employee_code || !formData.name || !formData.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('employees')
      .update({
        employee_code: formData.employee_code,
        name: formData.name,
        position: formData.position,
        email: formData.email || null,
        phone: formData.phone || null,
        hire_date: formData.hire_date,
        status: formData.status,
        attendance_days: parseInt(formData.attendance_days) || 0,
        leave_days: parseInt(formData.leave_days) || 0,
        salary: parseFloat(formData.salary) || null,
        department: formData.department || null
      })
      .eq('id', editingEmployee.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchEmployees();
    }
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      fetchEmployees();
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_code: employee.employee_code,
      name: employee.name,
      position: employee.position,
      email: employee.email || '',
      phone: employee.phone || '',
      hire_date: employee.hire_date,
      status: employee.status,
      attendance_days: employee.attendance_days.toString(),
      leave_days: employee.leave_days.toString(),
      salary: employee.salary?.toString() || '',
      department: employee.department || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingEmployee) {
      updateEmployee();
    } else {
      createEmployee();
    }
  };

  // Calculate today's attendance from Supabase
  const getTodayAttendance = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (!clientId) return { present: 0, onLeave: 0 };
    
    try {
      const { data, error } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', today);

      if (error) throw error;

      let present = 0;
      let onLeave = 0;
      
      data?.forEach(record => {
        if (record.status === 'present') present++;
        if (record.status === 'leave') onLeave++;
      });
      
      return { present, onLeave };
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return { present: 0, onLeave: 0 };
    }
  };

  const [attendanceStats, setAttendanceStats] = useState({ present: 0, onLeave: 0 });

  useEffect(() => {
    const loadAttendanceStats = async () => {
      const stats = await getTodayAttendance();
      setAttendanceStats(stats);
    };
    
    if (clientId) {
      loadAttendanceStats();
    }
  }, [clientId, employees]);

  const { present: presentToday, onLeave } = attendanceStats;
  const totalEmployees = employees.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Employee Management</h3>
          <p className="text-muted-foreground">Track attendance, leave records, and employee data with daily attendance tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-code">Employee Code *</Label>
                  <Input
                    id="employee-code"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                    placeholder="EMP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Administration"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire-date">Hire Date</Label>
                  <Input
                    id="hire-date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance Days</Label>
                  <Input
                    id="attendance"
                    type="number"
                    value={formData.attendance_days}
                    onChange={(e) => setFormData({...formData, attendance_days: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leave">Leave Days</Label>
                  <Input
                    id="leave"
                    type="number"
                    value={formData.leave_days}
                    onChange={(e) => setFormData({...formData, leave_days: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingEmployee ? 'Update Employee' : 'Create Employee'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{onLeave}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Employee Records</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-mono">{employee.employee_code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        {employee.email && (
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        )}
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : employee.status === 'on_leave' ? 'secondary' : 'outline'}>
                          {employee.status === 'active' ? 'Active' : employee.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Present: {employee.attendance_days} days</div>
                          <div>Leave: {employee.leave_days} days</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEmployee(employee.id, employee.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {employees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No employees found. Add your first employee to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceTracker employees={employees} clientId={clientId || ''} />
        </TabsContent>
        
        <TabsContent value="summary">
          <MonthlySummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}