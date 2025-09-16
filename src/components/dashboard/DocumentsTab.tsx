import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Receipt, BarChart3, Download } from 'lucide-react';
import { InvoiceCreator } from '@/components/documents/InvoiceCreator';
import { ChallanCreator } from '@/components/documents/ChallanCreator';
import { BalanceSheetCreator } from '@/components/documents/BalanceSheetCreator';

export function DocumentsTab() {
  const [activeDocTab, setActiveDocTab] = useState('invoice');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Documents & Reports</h2>
        <p className="text-muted-foreground">Create and manage business documents</p>
      </div>

      <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="invoice">Invoices</TabsTrigger>
          <TabsTrigger value="challan">Challans</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <InvoiceCreator />
        </TabsContent>

        <TabsContent value="challan">
          <ChallanCreator />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheetCreator />
        </TabsContent>
      </Tabs>
    </div>
  );
}