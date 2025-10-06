import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesSection } from '@/components/accounts/SalesSection';
import { PurchasesSection } from '@/components/accounts/PurchasesSection';
import { ExpensesSection } from '@/components/accounts/ExpensesSection';
import { AssetsLiabilitiesSection } from '@/components/accounts/AssetsLiabilitiesSection';
import { BankingSection } from '@/components/accounts/BankingSection';
import { TaxesSection } from '@/components/accounts/TaxesSection';
import { FinancialRecordsSection } from '@/components/accounts/FinancialRecordsSection';
import { LegalComplianceSection } from '@/components/accounts/LegalComplianceSection';
import { EmployeeSection } from '@/components/accounts/EmployeeSection';
import { CustomerSalesSection } from '@/components/accounts/CustomerSalesSection';
import { GeneralLedgerSection } from '@/components/accounts/GeneralLedgerSection';

export function AccountsTab() {
  const [activeAccountsTab, setActiveAccountsTab] = useState('sales');

  return (
    <div className="space-y-6 bg-background min-h-screen">
      <div className="bg-card border shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="h-6 w-6 bg-primary rounded"></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Financial Management Suite</h2>
            <p className="text-muted-foreground mt-1">Enterprise-grade accounting and financial controls</p>
          </div>
        </div>
        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">System Status:</span>
            <span className="font-medium text-green-600">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Module:</span>
            <span className="font-medium text-foreground">Financial Core</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">Version:</span>
            <span className="font-medium text-foreground">ERP 2024.1</span>
          </div>
        </div>
      </div>

      <Tabs value={activeAccountsTab} onValueChange={setActiveAccountsTab} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-7 w-full mb-6 bg-card border shadow-sm">
          <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Revenue Management</TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Procurement</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Expense Control</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Asset Management</TabsTrigger>
          <TabsTrigger value="banking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Treasury</TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">General Ledger</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Analytics & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesSection />
        </TabsContent>

        <TabsContent value="purchases">
          <PurchasesSection />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesSection />
        </TabsContent>

        <TabsContent value="assets">
          <AssetsLiabilitiesSection />
        </TabsContent>

        <TabsContent value="banking">
          <BankingSection />
        </TabsContent>

        <TabsContent value="ledger">
          <GeneralLedgerSection />
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Tax Compliance & Reporting
                </CardTitle>
                <CardDescription>Automated tax calculations and compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <TaxesSection />
              </CardContent>
            </Card>
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Financial Records
                </CardTitle>
                <CardDescription>Comprehensive financial data management</CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialRecordsSection />
              </CardContent>
            </Card>
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Legal & Compliance
                </CardTitle>
                <CardDescription>Regulatory compliance and audit trails</CardDescription>
              </CardHeader>
              <CardContent>
                <LegalComplianceSection />
              </CardContent>
            </Card>
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Human Resources
                </CardTitle>
                <CardDescription>Employee management and payroll processing</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeSection />
              </CardContent>
            </Card>
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Customer Relationship Management
                </CardTitle>
                <CardDescription>Customer data and relationship tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSalesSection />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}