import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Globe, Shield, Users, Settings } from 'lucide-react';

export default function AdminAccess() {
  const currentUrl = window.location.origin;
  const adminUrl = `${currentUrl}/admin`;

  const openAdmin = () => {
    window.open(adminUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">InviX ERP - Admin Access</h1>
          <p className="text-muted-foreground">Multiple ways to access your ERP system administration</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Desktop Admin Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Desktop Admin Panel
              </CardTitle>
              <CardDescription>Access admin panel from desktop application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono">{adminUrl}</p>
              </div>
              <Button onClick={openAdmin} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Open Admin Panel
              </Button>
            </CardContent>
          </Card>

          {/* Browser Admin Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Browser Access
              </CardTitle>
              <CardDescription>Access from any web browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Local Network:</p>
                <div className="p-2 bg-muted rounded text-xs font-mono">
                  http://localhost:8080/admin
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Production URL:</p>
                <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                  https://your-domain.com/admin
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Admin Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Admin Access
              </CardTitle>
              <CardDescription>Manage your ERP system from mobile devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Responsive admin interface</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Touch-optimized controls</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure authentication</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Add to home screen for app-like experience
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Features
              </CardTitle>
              <CardDescription>Complete system administration capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Client Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Password Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>Subscription Control</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="w-4 h-4 text-orange-600" />
                  <span>System Monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Desktop App</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Open Admin Panel" button above or navigate to Help → Admin Panel in the desktop app
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Web Browser</h3>
                <p className="text-sm text-muted-foreground">
                  Open your browser and go to the admin URL. Works on any device with internet access
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Mobile Device</h3>
                <p className="text-sm text-muted-foreground">
                  Use your mobile browser to access the admin URL. Add to home screen for quick access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}