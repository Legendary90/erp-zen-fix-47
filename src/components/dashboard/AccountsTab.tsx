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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Accounts Management</h2>
        <p className="text-muted-foreground">Complete financial and business records management</p>
      </div>

      <Tabs value={activeAccountsTab} onValueChange={setActiveAccountsTab} className="w-full">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full mb-6">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="assets">Assets & Liabilities</TabsTrigger>
          <TabsTrigger value="banking">Banking & Cashflow</TabsTrigger>
          <TabsTrigger value="taxes">Taxes & Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financial Records</TabsTrigger>
          <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
          <TabsTrigger value="employee">Employee</TabsTrigger>
          <TabsTrigger value="customer">Customer & Sales</TabsTrigger>
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

        <TabsContent value="taxes">
          <TaxesSection />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialRecordsSection />
        </TabsContent>

        <TabsContent value="legal">
          <LegalComplianceSection />
        </TabsContent>

        <TabsContent value="employee">
          <EmployeeSection />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerSalesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}