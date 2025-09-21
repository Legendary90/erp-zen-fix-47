import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Shield, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  description: string;
  status: string;
  issue_date: string;
  expiry_date: string;
  document_number: string;
  authority: string;
  file_path: string;
  created_at: string;
}

export function LegalComplianceSection() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [formData, setFormData] = useState({
    document_type: '',
    title: '',
    description: '',
    status: 'active',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    document_number: '',
    authority: '',
    file_path: ''
  });
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  const fetchDocuments = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch legal documents",
        variant: "destructive",
      });
    } else {
      setDocuments(data || []);
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: '',
      title: '',
      description: '',
      status: 'active',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      document_number: '',
      authority: '',
      file_path: ''
    });
    setEditingDocument(null);
  };

  const createDocument = async () => {
    if (!formData.document_type || !formData.title || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('legal_documents')
      .insert([{
        client_id: clientId,
        document_type: formData.document_type,
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date || null,
        document_number: formData.document_number || null,
        authority: formData.authority || null,
        file_path: formData.file_path || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create legal document",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Legal document created successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchDocuments();
    }
  };

  const updateDocument = async () => {
    if (!editingDocument || !formData.document_type || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('legal_documents')
      .update({
        document_type: formData.document_type,
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date || null,
        document_number: formData.document_number || null,
        authority: formData.authority || null,
        file_path: formData.file_path || null
      })
      .eq('id', editingDocument.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update legal document",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Legal document updated successfully",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchDocuments();
    }
  };

  const deleteDocument = async (documentId: string, documentTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('legal_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete legal document",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Legal document deleted successfully",
      });
      fetchDocuments();
    }
  };

  const openEditDialog = (document: LegalDocument) => {
    setEditingDocument(document);
    setFormData({
      document_type: document.document_type,
      title: document.title,
      description: document.description || '',
      status: document.status,
      issue_date: document.issue_date,
      expiry_date: document.expiry_date || '',
      document_number: document.document_number || '',
      authority: document.authority || '',
      file_path: document.file_path || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingDocument) {
      updateDocument();
    } else {
      createDocument();
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const activeContracts = documents.filter(d => d.document_type === 'Contract' && d.status === 'active').length;
  const validLicenses = documents.filter(d => d.document_type === 'License' && d.status === 'active').length;
  const insurancePolicies = documents.filter(d => d.document_type === 'Insurance' && d.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Legal & Compliance Records</h3>
          <p className="text-muted-foreground">Manage contracts, licenses, insurance, and regulatory filings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingDocument ? 'Edit Legal Document' : 'Add New Legal Document'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type *</Label>
                  <Select value={formData.document_type} onValueChange={(value) => setFormData({...formData, document_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="License">License</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Permit">Permit</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Agreement">Agreement</SelectItem>
                      <SelectItem value="Policy">Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Business License"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Document description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-number">Document Number</Label>
                  <Input
                    id="document-number"
                    value={formData.document_number}
                    onChange={(e) => setFormData({...formData, document_number: e.target.value})}
                    placeholder="DOC-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authority">Issuing Authority</Label>
                  <Input
                    id="authority"
                    value={formData.authority}
                    onChange={(e) => setFormData({...formData, authority: e.target.value})}
                    placeholder="Government Agency"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-date">Issue Date</Label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-path">File Path/Reference</Label>
                <Input
                  id="file-path"
                  value={formData.file_path}
                  onChange={(e) => setFormData({...formData, file_path: e.target.value})}
                  placeholder="/documents/business-license.pdf"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingDocument ? 'Update Document' : 'Create Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Licenses</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{validLicenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Policies</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{insurancePolicies}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <Badge variant="outline">{document.document_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{document.title}</div>
                    {document.description && (
                      <div className="text-sm text-muted-foreground">{document.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{document.document_number || '-'}</TableCell>
                  <TableCell>{document.authority || '-'}</TableCell>
                  <TableCell>
                    {document.expiry_date ? (
                      <div className={`flex items-center gap-2 ${
                        isExpired(document.expiry_date) 
                          ? 'text-red-600' 
                          : isExpiringSoon(document.expiry_date) 
                            ? 'text-orange-600' 
                            : ''
                      }`}>
                        {(isExpired(document.expiry_date) || isExpiringSoon(document.expiry_date)) && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {new Date(document.expiry_date).toLocaleDateString()}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      document.status === 'active' ? 'default' : 
                      document.status === 'expired' ? 'destructive' : 
                      'secondary'
                    }>
                      {document.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDocument(document.id, document.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No legal documents found. Add your first document to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}