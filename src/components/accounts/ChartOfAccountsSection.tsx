import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building, CreditCard, TrendingUp, DollarSign, Minus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_id: string | null;
  is_active: boolean;
  created_at: string;
  client_id: string;
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', icon: Building, color: 'bg-blue-100 text-blue-800' },
  { value: 'liability', label: 'Liability', icon: CreditCard, color: 'bg-red-100 text-red-800' },
  { value: 'equity', label: 'Equity', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
  { value: 'revenue', label: 'Revenue', icon: DollarSign, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'expense', label: 'Expense', icon: Minus, color: 'bg-orange-100 text-orange-800' }
];

export function ChartOfAccountsSection() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [parentAccountId, setParentAccountId] = useState('none');
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, [clientId]);

  const fetchAccounts = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('client_id', clientId)
      .order('account_code');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
    } else {
      setAccounts(data || []);
    }
  };

  const createAccount = async () => {
    if (!accountCode || !accountName || !accountType || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('accounts')
      .insert([{
        client_id: clientId,
        account_code: accountCode,
        account_name: accountName,
        account_type: accountType,
        parent_account_id: parentAccountId && parentAccountId !== 'none' ? parentAccountId : null,
        is_active: true
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      setAccountCode('');
      setAccountName('');
      setAccountType('');
      setParentAccountId('none');
      setIsDialogOpen(false);
      fetchAccounts();
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: !currentStatus })
      .eq('id', accountId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Account ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchAccounts();
    }
  };

  const getTypeInfo = (type: string) => {
    return ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
  };

  const deleteAccount = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete the account "${accountName}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
      fetchAccounts();
    }
  };

  const getAccountsByType = (type: string) => {
    return accounts.filter(acc => acc.account_type === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Chart of Accounts</h3>
          <p className="text-muted-foreground">Manage your account structure and hierarchy</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-code">Account Code</Label>
                <Input
                  id="account-code"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="e.g., 1100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., Cash in Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-account">Parent Account (Optional)</Label>
                <Select value={parentAccountId} onValueChange={setParentAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {accounts
                      .filter(acc => acc.account_type === accountType)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_code} - {account.account_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAccount}>Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {ACCOUNT_TYPES.map((type) => {
          const Icon = type.icon;
          const typeAccounts = getAccountsByType(type.value);
          return (
            <Card key={type.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeAccounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {typeAccounts.filter(acc => acc.is_active).length} active
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        {ACCOUNT_TYPES.map((type) => {
          const Icon = type.icon;
          const typeAccounts = getAccountsByType(type.value);
          
          if (typeAccounts.length === 0) return null;
          
          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {type.label} Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.account_code}</TableCell>
                        <TableCell className="font-medium">{account.account_name}</TableCell>
                        <TableCell>
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                         <TableCell>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => toggleAccountStatus(account.id, account.is_active)}
                             >
                               {account.is_active ? 'Deactivate' : 'Activate'}
                             </Button>
                             <Button
                               variant="destructive"
                               size="sm"
                               onClick={() => deleteAccount(account.id, account.account_name)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No accounts found. Create your first account to get started with your chart of accounts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}