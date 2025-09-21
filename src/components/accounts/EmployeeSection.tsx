import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

export function EmployeeSection() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', position: 'Manager', attendance: 22, leave: 3, status: 'active' },
    { id: 2, name: 'Jane Smith', position: 'Associate', attendance: 20, leave: 5, status: 'active' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Employee Management</h3>
        <p className="text-muted-foreground">Track attendance, leave records, and employee data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employees.filter(e => e.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{emp.name}</h4>
                  <p className="text-sm text-muted-foreground">{emp.position}</p>
                  <p className="text-sm text-muted-foreground">Attendance: {emp.attendance} days | Leave: {emp.leave} days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setEmployees(employees.filter(e => e.id !== emp.id))}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}