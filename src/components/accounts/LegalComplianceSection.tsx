import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield } from 'lucide-react';

export function LegalComplianceSection() {
  const [documents, setDocuments] = useState([
    { id: 1, type: 'Contract', title: 'Supplier Agreement', status: 'active', expiry: '2024-12-31' },
    { id: 2, type: 'License', title: 'Business License', status: 'active', expiry: '2024-06-30' },
    { id: 3, type: 'Insurance', title: 'General Liability', status: 'active', expiry: '2024-08-15' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Legal & Compliance Records</h3>
        <p className="text-muted-foreground">Manage contracts, licenses, insurance, and regulatory filings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.type === 'Contract').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Licenses</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.type === 'License').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Policies</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.type === 'Insurance').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">{doc.type}</p>
                  <p className="text-sm text-muted-foreground">Expires: {doc.expiry}</p>
                </div>
                <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}