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
import { Plus, Users, Calendar, Trash2, Edit, Check, X, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTracker } from './AttendanceTracker';
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

interface EmployeeMonthlySummary {
  total_working_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  half_days: number;
  attendance_percentage: string;
}

export function EmployeeSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<Record<string, EmployeeMonthlySummary>>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
    fetchMonthlySummaries();
  }, [clientId, selectedMonth, selectedYear]);

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

  const fetchMonthlySummaries = async () => {
    if (!clientId) return;

    try {
      // Get all employees first
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, name, employee_code')
        .eq('client_id', clientId);

      if (empError) throw empError;

      // Get monthly summary data
      const { data: summaries, error: summError } = await supabase
        .from('monthly_attendance_summary')
        .select('*')
        .eq('client_id', clientId)
        .eq('month_number', selectedMonth)
        .eq('year', selectedYear);

      if (summError) throw summError;

      // Create a map of employee_id to summary data
      const summaryMap: Record<string, EmployeeMonthlySummary> = {};
      
      summaries?.forEach(item => {
        summaryMap[item.employee_id] = {
          total_working_days: item.total_working_days || 0,
          present_days: item.present_days || 0,
          absent_days: item.absent_days || 0,
          leave_days: item.leave_days || 0,
          half_days: item.half_days || 0,
          attendance_percentage: (item.total_working_days || 0) > 0 
            ? `${(((item.present_days || 0) + ((item.half_days || 0) * 0.5)) / (item.total_working_days || 1) * 100).toFixed(1)}%`
            : '0%'
        };
      });

      setMonthlySummaries(summaryMap);
    } catch (error) {
      console.error('Error loading monthly summaries:', error);
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Employee Records</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="space-y-4">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Employee Records & Monthly Summary</CardTitle>
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
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
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
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                View employee information and monthly attendance statistics for {
                  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]
                } {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Position</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Total Days</TableHead>
                      <TableHead className="font-semibold text-center">Present</TableHead>
                      <TableHead className="font-semibold text-center">Absent</TableHead>
                      <TableHead className="font-semibold text-center">Leave</TableHead>
                      <TableHead className="font-semibold text-center">Half Days</TableHead>
                      <TableHead className="font-semibold text-center">Attendance %</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          No employees found. Add your first employee to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => {
                        const summary = monthlySummaries[employee.id];
                        return (
                          <TableRow key={employee.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono font-medium">{employee.employee_code}</TableCell>
                            <TableCell>
                              <div className="font-medium">{employee.name}</div>
                              {employee.email && (
                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                              )}
                            </TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>{employee.department || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                employee.status === 'active' ? 'default' : 
                                employee.status === 'on_leave' ? 'secondary' : 'outline'
                              }>
                                {employee.status === 'active' ? 'Active' : 
                                 employee.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {summary?.total_working_days || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono bg-green-50 text-green-700 border-green-200">
                                {summary?.present_days || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono bg-red-50 text-red-700 border-red-200">
                                {summary?.absent_days || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                                {summary?.leave_days || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono bg-orange-50 text-orange-700 border-orange-200">
                                {summary?.half_days || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono font-semibold bg-primary/10 text-primary border-primary/30">
                                {summary?.attendance_percentage || '0%'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(employee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteEmployee(employee.id, employee.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTracker employees={employees} clientId={clientId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
}