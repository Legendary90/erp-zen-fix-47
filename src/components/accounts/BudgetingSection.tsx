import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calculator, BarChart3, Target } from 'lucide-react';

export function BudgetingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Budgeting & Forecasting</h3>
        <p className="text-muted-foreground">Financial planning and budget management tools</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Not configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Budgeting & Forecasting</h3>
          <p className="text-muted-foreground mb-4">
            Advanced budgeting and forecasting features will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Budget creation and management</li>
            <li>• Variance analysis</li>
            <li>• Cash flow forecasting</li>
            <li>• Scenario planning</li>
            <li>• Budget vs actual reporting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}