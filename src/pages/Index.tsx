import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            InviX ERP System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete business management solution for modern enterprises
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Client Access</CardTitle>
                <CardDescription>Access your business dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button className="w-full">Client Login / Register</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage clients and system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button variant="outline" className="w-full mb-2">Admin Login</Button>
                </Link>
                <Link to="/admin-access">
                  <Button variant="secondary" className="w-full">Admin Access Info</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Sales Management</h3>
              <p className="text-sm text-muted-foreground">Track revenue and transactions</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Inventory Control</h3>
              <p className="text-sm text-muted-foreground">Manage stock and items</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Expense Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor business costs</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Reports & Analytics</h3>
              <p className="text-sm text-muted-foreground">Profit/loss insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
