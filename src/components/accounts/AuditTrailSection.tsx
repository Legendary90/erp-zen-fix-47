import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Shield, Eye, Clock } from 'lucide-react';

export function AuditTrailSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Audit Trail</h3>
        <p className="text-muted-foreground">Complete transaction history and audit logs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">No activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">All logs protected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audit Trail System</h3>
          <p className="text-muted-foreground mb-4">
            Comprehensive audit trail features will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Complete transaction history</li>
            <li>• User activity logs</li>
            <li>• Change tracking</li>
            <li>• Security audit reports</li>
            <li>• Compliance monitoring</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}