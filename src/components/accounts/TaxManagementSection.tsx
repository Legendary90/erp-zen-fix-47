import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

export function TaxManagementSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Tax Management</h3>
        <p className="text-muted-foreground">Tax compliance and calculation tools</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tax Management System</h3>
          <p className="text-muted-foreground mb-4">
            Comprehensive tax management features will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Automated tax calculations</li>
            <li>• Tax code management</li>
            <li>• Tax return preparation</li>
            <li>• Compliance tracking</li>
            <li>• Tax reporting and filing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}