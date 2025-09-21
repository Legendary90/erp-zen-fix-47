import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Star, MessageSquare } from 'lucide-react';

export function CustomerSalesSection() {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'ABC Corp', contact: 'contact@abc.com', phone: '123-456-7890', status: 'active', rating: 5 },
    { id: 2, name: 'XYZ Ltd', contact: 'info@xyz.com', phone: '098-765-4321', status: 'active', rating: 4 }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Customer & Sales Records</h3>
        <p className="text-muted-foreground">Manage customer information, invoices, and feedback</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customers.filter(c => c.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{customer.name}</h4>
                  <p className="text-sm text-muted-foreground">{customer.contact}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{customer.rating}</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCustomers(customers.filter(c => c.id !== customer.id))}
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