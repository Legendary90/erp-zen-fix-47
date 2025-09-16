import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CreditCard } from 'lucide-react';

export function AssetsLiabilitiesSection() {
  const [assets, setAssets] = useState({
    cash: '',
    bank: '',
    inventory: '',
    land: '',
    machinery: '',
    vehicles: '',
    furniture: '',
    other: ''
  });

  const [liabilities, setLiabilities] = useState({
    accounts_payable: '',
    short_loans: '',
    long_loans: '',
    taxes_payable: '',
    other: ''
  });

  const calculateTotalAssets = () => {
    return Object.values(assets).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
  };

  const calculateTotalLiabilities = () => {
    return Object.values(liabilities).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
  };

  const netWorth = calculateTotalAssets() - calculateTotalLiabilities();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Assets & Liabilities</h3>
        <p className="text-muted-foreground">Track your company's financial position</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${calculateTotalAssets().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${calculateTotalLiabilities().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netWorth.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Assets Management</CardTitle>
              <CardDescription>Record and manage your company assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Current Assets</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cash">Cash in Hand</Label>
                    <Input
                      id="cash"
                      type="number"
                      value={assets.cash}
                      onChange={(e) => setAssets({...assets, cash: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank">Bank Balance</Label>
                    <Input
                      id="bank"
                      type="number"
                      value={assets.bank}
                      onChange={(e) => setAssets({...assets, bank: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inventory">Inventory Value</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={assets.inventory}
                      onChange={(e) => setAssets({...assets, inventory: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Fixed Assets</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="land">Land & Buildings</Label>
                    <Input
                      id="land"
                      type="number"
                      value={assets.land}
                      onChange={(e) => setAssets({...assets, land: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="machinery">Machinery & Equipment</Label>
                    <Input
                      id="machinery"
                      type="number"
                      value={assets.machinery}
                      onChange={(e) => setAssets({...assets, machinery: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicles">Vehicles</Label>
                    <Input
                      id="vehicles"
                      type="number"
                      value={assets.vehicles}
                      onChange={(e) => setAssets({...assets, vehicles: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="furniture">Furniture & Fixtures</Label>
                    <Input
                      id="furniture"
                      type="number"
                      value={assets.furniture}
                      onChange={(e) => setAssets({...assets, furniture: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Assets</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liabilities">
          <Card>
            <CardHeader>
              <CardTitle>Liabilities Management</CardTitle>
              <CardDescription>Record and manage your company liabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Current Liabilities</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="accounts_payable">Accounts Payable</Label>
                    <Input
                      id="accounts_payable"
                      type="number"
                      value={liabilities.accounts_payable}
                      onChange={(e) => setLiabilities({...liabilities, accounts_payable: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="short_loans">Short-term Loans</Label>
                    <Input
                      id="short_loans"
                      type="number"
                      value={liabilities.short_loans}
                      onChange={(e) => setLiabilities({...liabilities, short_loans: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="taxes_payable">Taxes Payable</Label>
                    <Input
                      id="taxes_payable"
                      type="number"
                      value={liabilities.taxes_payable}
                      onChange={(e) => setLiabilities({...liabilities, taxes_payable: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Long-term Liabilities</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="long_loans">Long-term Loans</Label>
                    <Input
                      id="long_loans"
                      type="number"
                      value={liabilities.long_loans}
                      onChange={(e) => setLiabilities({...liabilities, long_loans: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Liabilities</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}