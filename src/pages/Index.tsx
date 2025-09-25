import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, Clock, Zap, Settings, Building, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            Enterprise Resource Planning
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            InviX ERP System
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete business management solution for modern enterprises. Streamline operations, boost productivity, and drive growth with our comprehensive ERP platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Client Portal</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Accounting & Finance</CardTitle>
                <CardDescription>
                  Complete financial management with profit/loss tracking and period-based accounting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Employee Attendance</CardTitle>
                <CardDescription>
                  Daily attendance tracking with monthly summaries and comprehensive reporting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Create invoices, challans, balance sheets and manage all business documents
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Access Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Access
                </CardTitle>
                <CardDescription>
                  Access your business dashboard and manage your company data with full ERP capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button className="w-full">Login / Register</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Portal
                  <Badge variant="destructive" className="text-xs">RESTRICTED</Badge>
                </CardTitle>
                <CardDescription>
                  System administration, client management, and platform configuration tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button variant="destructive" className="w-full">Admin Login</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Trusted by businesses worldwide • Enterprise-grade security • 24/7 support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;