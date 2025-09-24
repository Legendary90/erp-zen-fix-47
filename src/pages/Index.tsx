import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, Clock, Zap, Settings } from "lucide-react";

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
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  Complete workforce management with attendance tracking, payroll, and performance monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Sales & Revenue</CardTitle>
                <CardDescription>
                  Track sales performance, manage customer relationships, and monitor revenue streams
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Inventory Control</CardTitle>
                <CardDescription>
                  Real-time inventory tracking, automated stock alerts, and supply chain optimization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>
                  Comprehensive accounting, expense tracking, and financial reporting capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>
                  Advanced time tracking with project management and productivity analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle>Automation</CardTitle>
                <CardDescription>
                  Automated workflows, intelligent reporting, and streamlined business processes
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