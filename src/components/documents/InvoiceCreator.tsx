import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download } from 'lucide-react';

export function InvoiceCreator() {
  const [invoiceData, setInvoiceData] = useState({
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerGST: '',
    buyerName: '',
    buyerAddress: '',
    buyerContact: '',
    buyerNTN: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    productDescription: '',
    quantity: '',
    rate: '',
    discount: '',
    taxRate: '',
    paymentTerms: ''
  });

  const calculateSubtotal = () => {
    const qty = parseFloat(invoiceData.quantity) || 0;
    const rate = parseFloat(invoiceData.rate) || 0;
    return qty * rate;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(invoiceData.discount) || 0;
    return (subtotal * discountPercent) / 100;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal() - calculateDiscount();
    const taxPercent = parseFloat(invoiceData.taxRate) || 0;
    return (subtotal * taxPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Invoice Creator</h3>
        <p className="text-muted-foreground">Create professional invoices with all required details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input
                value={invoiceData.sellerName}
                onChange={(e) => setInvoiceData({...invoiceData, sellerName: e.target.value})}
                placeholder="Your company name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea
                value={invoiceData.sellerAddress}
                onChange={(e) => setInvoiceData({...invoiceData, sellerAddress: e.target.value})}
                placeholder="Complete address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={invoiceData.sellerPhone}
                onChange={(e) => setInvoiceData({...invoiceData, sellerPhone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label>GST/Tax Number</Label>
              <Input
                value={invoiceData.sellerGST}
                onChange={(e) => setInvoiceData({...invoiceData, sellerGST: e.target.value})}
                placeholder="GST/Tax registration number"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Buyer Name</Label>
              <Input
                value={invoiceData.buyerName}
                onChange={(e) => setInvoiceData({...invoiceData, buyerName: e.target.value})}
                placeholder="Customer/Company name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea
                value={invoiceData.buyerAddress}
                onChange={(e) => setInvoiceData({...invoiceData, buyerAddress: e.target.value})}
                placeholder="Customer address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact</Label>
              <Input
                value={invoiceData.buyerContact}
                onChange={(e) => setInvoiceData({...invoiceData, buyerContact: e.target.value})}
                placeholder="Phone/Email"
              />
            </div>
            <div className="grid gap-2">
              <Label>NTN/GST Number</Label>
              <Input
                value={invoiceData.buyerNTN}
                onChange={(e) => setInvoiceData({...invoiceData, buyerNTN: e.target.value})}
                placeholder="Customer tax number"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Invoice Number</Label>
              <Input
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                placeholder="INV-001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment Terms</Label>
              <Input
                value={invoiceData.paymentTerms}
                onChange={(e) => setInvoiceData({...invoiceData, paymentTerms: e.target.value})}
                placeholder="Net 30 days"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product/Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={invoiceData.productDescription}
                onChange={(e) => setInvoiceData({...invoiceData, productDescription: e.target.value})}
                placeholder="Product/service description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={invoiceData.quantity}
                  onChange={(e) => setInvoiceData({...invoiceData, quantity: e.target.value})}
                  placeholder="1"
                />
              </div>
              <div className="grid gap-2">
                <Label>Rate</Label>
                <Input
                  type="number"
                  value={invoiceData.rate}
                  onChange={(e) => setInvoiceData({...invoiceData, rate: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({...invoiceData, discount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={invoiceData.taxRate}
                  onChange={(e) => setInvoiceData({...invoiceData, taxRate: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${calculateDiscount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
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