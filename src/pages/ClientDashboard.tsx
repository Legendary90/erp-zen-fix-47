import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function ClientDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Client Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your ERP system</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Sales Management</CardTitle>
              <CardDescription>Track and manage your sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Sales</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage your inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Inventory</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Track your business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Expenses</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Challans</CardTitle>
              <CardDescription>Manage delivery challans</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Challans</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Manage item groups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Groups</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View profit/loss reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}