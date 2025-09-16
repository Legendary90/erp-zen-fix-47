import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';

export function BalanceSheetCreator() {
  const [balanceSheet, setBalanceSheet] = useState({
    // Current Assets
    cashInHand: '',
    bankBalance: '',
    accountsReceivable: '',
    inventory: '',
    prepaidExpenses: '',
    
    // Fixed Assets
    landBuilding: '',
    machinery: '',
    vehicles: '',
    furniture: '',
    intangibleAssets: '',
    
    // Current Liabilities
    accountsPayable: '',
    shortTermLoans: '',
    taxesPayable: '',
    salariesPayable: '',
    
    // Long-term Liabilities
    bankLoans: '',
    bondsPayable: '',
    leaseObligations: '',
    
    // Equity
    shareCapital: '',
    retainedEarnings: '',
    reserves: ''
  });

  const calculateCurrentAssets = () => {
    return Object.entries(balanceSheet)
      .filter(([key]) => ['cashInHand', 'bankBalance', 'accountsReceivable', 'inventory', 'prepaidExpenses'].includes(key))
      .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
  };

  const calculateFixedAssets = () => {
    return Object.entries(balanceSheet)
      .filter(([key]) => ['landBuilding', 'machinery', 'vehicles', 'furniture', 'intangibleAssets'].includes(key))
      .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
  };

  const calculateCurrentLiabilities = () => {
    return Object.entries(balanceSheet)
      .filter(([key]) => ['accountsPayable', 'shortTermLoans', 'taxesPayable', 'salariesPayable'].includes(key))
      .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
  };

  const calculateLongTermLiabilities = () => {
    return Object.entries(balanceSheet)
      .filter(([key]) => ['bankLoans', 'bondsPayable', 'leaseObligations'].includes(key))
      .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
  };

  const calculateTotalEquity = () => {
    return Object.entries(balanceSheet)
      .filter(([key]) => ['shareCapital', 'retainedEarnings', 'reserves'].includes(key))
      .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
  };

  const totalAssets = calculateCurrentAssets() + calculateFixedAssets();
  const totalLiabilities = calculateCurrentLiabilities() + calculateLongTermLiabilities();
  const totalEquity = calculateTotalEquity();
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Balance Sheet Creator</h3>
        <p className="text-muted-foreground">Create comprehensive balance sheet with assets, liabilities, and equity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Current Assets</h4>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Cash in Hand</Label>
                  <Input
                    type="number"
                    value={balanceSheet.cashInHand}
                    onChange={(e) => setBalanceSheet({...balanceSheet, cashInHand: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Bank Balance</Label>
                  <Input
                    type="number"
                    value={balanceSheet.bankBalance}
                    onChange={(e) => setBalanceSheet({...balanceSheet, bankBalance: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Accounts Receivable</Label>
                  <Input
                    type="number"
                    value={balanceSheet.accountsReceivable}
                    onChange={(e) => setBalanceSheet({...balanceSheet, accountsReceivable: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Inventory</Label>
                  <Input
                    type="number"
                    value={balanceSheet.inventory}
                    onChange={(e) => setBalanceSheet({...balanceSheet, inventory: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Fixed Assets</h4>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Land & Buildings</Label>
                  <Input
                    type="number"
                    value={balanceSheet.landBuilding}
                    onChange={(e) => setBalanceSheet({...balanceSheet, landBuilding: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Machinery & Equipment</Label>
                  <Input
                    type="number"
                    value={balanceSheet.machinery}
                    onChange={(e) => setBalanceSheet({...balanceSheet, machinery: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vehicles</Label>
                  <Input
                    type="number"
                    value={balanceSheet.vehicles}
                    onChange={(e) => setBalanceSheet({...balanceSheet, vehicles: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Current Liabilities</h4>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Accounts Payable</Label>
                  <Input
                    type="number"
                    value={balanceSheet.accountsPayable}
                    onChange={(e) => setBalanceSheet({...balanceSheet, accountsPayable: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Short-term Loans</Label>
                  <Input
                    type="number"
                    value={balanceSheet.shortTermLoans}
                    onChange={(e) => setBalanceSheet({...balanceSheet, shortTermLoans: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Taxes Payable</Label>
                  <Input
                    type="number"
                    value={balanceSheet.taxesPayable}
                    onChange={(e) => setBalanceSheet({...balanceSheet, taxesPayable: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Long-term Liabilities</h4>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Bank Loans</Label>
                  <Input
                    type="number"
                    value={balanceSheet.bankLoans}
                    onChange={(e) => setBalanceSheet({...balanceSheet, bankLoans: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Owner's Equity</h4>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Share Capital</Label>
                  <Input
                    type="number"
                    value={balanceSheet.shareCapital}
                    onChange={(e) => setBalanceSheet({...balanceSheet, shareCapital: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Retained Earnings</Label>
                  <Input
                    type="number"
                    value={balanceSheet.retainedEarnings}
                    onChange={(e) => setBalanceSheet({...balanceSheet, retainedEarnings: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Assets</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Assets:</span>
                  <span>${calculateCurrentAssets().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Assets:</span>
                  <span>${calculateFixedAssets().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Assets:</span>
                  <span>${totalAssets.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Liabilities & Equity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Liabilities:</span>
                  <span>${calculateCurrentLiabilities().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Long-term Liabilities:</span>
                  <span>${calculateLongTermLiabilities().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Equity:</span>
                  <span>${totalEquity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Liab. & Equity:</span>
                  <span>${totalLiabilitiesEquity.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Balance Check:</span>
              <span className={`font-bold ${Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01 ? 'Balanced ✓' : 'Not Balanced ✗'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Balance Sheet
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}