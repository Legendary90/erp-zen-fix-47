import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { HistoryTab } from '@/components/dashboard/HistoryTab';
import { AccountsTab } from '@/components/dashboard/AccountsTab';
import { DocumentsTab } from '@/components/dashboard/DocumentsTab';

export default function ClientDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">InviX ERP System</h1>
              <p className="text-muted-foreground">Complete Business Management</p>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-card border">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Financial Management</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Transaction History</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Document Center</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <AccountsTab />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}