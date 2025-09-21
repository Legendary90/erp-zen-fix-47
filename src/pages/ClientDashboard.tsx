import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
import { DocumentsTab } from '@/components/dashboard/DocumentsTab';
import { AccountingPeriodsSection } from '@/components/accounts/AccountingPeriodsSection';
import { ChartOfAccountsSection } from '@/components/accounts/ChartOfAccountsSection';
import { GeneralLedgerSection } from '@/components/accounts/GeneralLedgerSection';
import { AccountsReceivableSection } from '@/components/accounts/AccountsReceivableSection';
import { AccountsPayableSection } from '@/components/accounts/AccountsPayableSection';
import { CustomerManagementSection } from '@/components/accounts/CustomerManagementSection';
import { VendorManagementSection } from '@/components/accounts/VendorManagementSection';
import { FinancialReportsSection } from '@/components/accounts/FinancialReportsSection';
import { BudgetingSection } from '@/components/accounts/BudgetingSection';
import { TaxManagementSection } from '@/components/accounts/TaxManagementSection';
import { AuditTrailSection } from '@/components/accounts/AuditTrailSection';
import { 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  Building, 
  PiggyBank, 
  FileText, 
  Receipt, 
  Shield, 
  Users, 
  UserCheck, 
  Clock, 
  FolderOpen,
  Calendar,
  BarChart3,
  BookOpen,
  Package,
  UserPlus,
  Truck,
  TrendingUp,
  Calculator,
  Settings
} from 'lucide-react';

export default function ClientDashboard() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('sales');

  const sidebarItems = [
    { id: 'sales', label: 'Sales Management', icon: DollarSign, component: SalesSection },
    { id: 'purchases', label: 'Purchase Orders', icon: ShoppingCart, component: PurchasesSection },
    { id: 'expenses', label: 'Expense Tracking', icon: CreditCard, component: ExpensesSection },
    { id: 'assets', label: 'Assets & Liabilities', icon: Building, component: AssetsLiabilitiesSection },
    { id: 'banking', label: 'Banking & Treasury', icon: PiggyBank, component: BankingSection },
    { id: 'periods', label: 'Accounting Periods', icon: Calendar, component: AccountingPeriodsSection },
    { id: 'chart', label: 'Chart of Accounts', icon: BookOpen, component: ChartOfAccountsSection },
    { id: 'ledger', label: 'General Ledger', icon: BarChart3, component: GeneralLedgerSection },
    { id: 'receivables', label: 'Accounts Receivable', icon: TrendingUp, component: AccountsReceivableSection },
    { id: 'payables', label: 'Accounts Payable', icon: Package, component: AccountsPayableSection },
    { id: 'customers', label: 'Customer Management', icon: UserPlus, component: CustomerManagementSection },
    { id: 'vendors', label: 'Vendor Management', icon: Truck, component: VendorManagementSection },
    { id: 'reports', label: 'Financial Reports', icon: FileText, component: FinancialReportsSection },
    { id: 'budgeting', label: 'Budget Planning', icon: Calculator, component: BudgetingSection },
    { id: 'taxes', label: 'Tax Management', icon: Receipt, component: TaxesSection },
    { id: 'records', label: 'Financial Records', icon: FolderOpen, component: FinancialRecordsSection },
    { id: 'compliance', label: 'Legal Compliance', icon: Shield, component: LegalComplianceSection },
    { id: 'employees', label: 'HR Management', icon: Users, component: EmployeeSection },
    { id: 'crm', label: 'Customer Relations', icon: UserCheck, component: CustomerSalesSection },
    { id: 'taxmgt', label: 'Tax Compliance', icon: Settings, component: TaxManagementSection },
    { id: 'audit', label: 'Audit Trail', icon: Clock, component: AuditTrailSection },
    { id: 'documents', label: 'Document Center', icon: FolderOpen, component: DocumentsTab },
  ];

  const ActiveComponent = sidebarItems.find(item => item.id === activeSection)?.component || SalesSection;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">InviX ERP</h1>
              <p className="text-sm text-muted-foreground">Enterprise Resource Planning</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
            <div>Version: ERP 2024.1</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            {(() => {
              const activeItem = sidebarItems.find(item => item.id === activeSection);
              const Icon = activeItem?.icon || DollarSign;
              return <Icon className="h-5 w-5 text-primary" />;
            })()}
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Sales Management'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Professional enterprise-grade financial management system
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}