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

export function AccountsTab() {
  const [activeAccountsTab, setActiveAccountsTab] = useState('sales');

  return (
    <div className="space-y-6 bg-background min-h-screen">
      <div className="bg-sidebar-background border border-sidebar-border rounded-lg p-6">
        <h2 className="text-3xl font-bold text-sidebar-primary">Enterprise Accounting System</h2>
        <p className="text-sidebar-foreground mt-2">Complete financial and business records management platform</p>
        <div className="flex gap-4 mt-4">
          <div className="text-sm">
            <span className="text-sidebar-foreground/60">Module:</span>
            <span className="text-sidebar-primary font-medium ml-1">Financial Management</span>
          </div>
          <div className="text-sm">
            <span className="text-sidebar-foreground/60">Version:</span>
            <span className="text-sidebar-primary font-medium ml-1">Enterprise 2024</span>
          </div>
        </div>
      </div>

      <Tabs value={activeAccountsTab} onValueChange={setActiveAccountsTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-6 bg-sidebar-background border border-sidebar-border">
          <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Purchases</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Expenses</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Assets & Liabilities</TabsTrigger>
          <TabsTrigger value="banking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Banking</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Reports</TabsTrigger>
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

        <TabsContent value="reports">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-sidebar-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Tax Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaxesSection />
              </CardContent>
            </Card>
            <Card className="border-sidebar-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Financial Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FinancialRecordsSection />
              </CardContent>
            </Card>
            <Card className="border-sidebar-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Legal & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LegalComplianceSection />
              </CardContent>
            </Card>
            <Card className="border-sidebar-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Employee Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeSection />
              </CardContent>
            </Card>
            <Card className="border-sidebar-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Customer Relations
                </CardTitle>
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