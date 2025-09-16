import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download } from 'lucide-react';

export function ChallanCreator() {
  const [challanData, setChallanData] = useState({
    challanNumber: '',
    date: new Date().toISOString().split('T')[0],
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    goodsDescription: '',
    batchNumber: '',
    quantity: '',
    weight: '',
    units: '',
    truckNumber: '',
    driverName: '',
    courierService: ''
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Challan Creator</h3>
        <p className="text-muted-foreground">Create delivery challans for goods transportation</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Challan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Challan Number</Label>
              <Input
                value={challanData.challanNumber}
                onChange={(e) => setChallanData({...challanData, challanNumber: e.target.value})}
                placeholder="CH-001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={challanData.date}
                onChange={(e) => setChallanData({...challanData, date: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sender Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Sender Name</Label>
              <Input
                value={challanData.senderName}
                onChange={(e) => setChallanData({...challanData, senderName: e.target.value})}
                placeholder="Company/Person name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Sender Address</Label>
              <Textarea
                value={challanData.senderAddress}
                onChange={(e) => setChallanData({...challanData, senderAddress: e.target.value})}
                placeholder="Complete address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receiver Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Receiver Name</Label>
              <Input
                value={challanData.receiverName}
                onChange={(e) => setChallanData({...challanData, receiverName: e.target.value})}
                placeholder="Company/Person name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Receiver Address</Label>
              <Textarea
                value={challanData.receiverAddress}
                onChange={(e) => setChallanData({...challanData, receiverAddress: e.target.value})}
                placeholder="Delivery address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goods Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Description of Goods</Label>
              <Textarea
                value={challanData.goodsDescription}
                onChange={(e) => setChallanData({...challanData, goodsDescription: e.target.value})}
                placeholder="Product description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Batch/Lot Number</Label>
              <Input
                value={challanData.batchNumber}
                onChange={(e) => setChallanData({...challanData, batchNumber: e.target.value})}
                placeholder="Batch number (if applicable)"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  value={challanData.quantity}
                  onChange={(e) => setChallanData({...challanData, quantity: e.target.value})}
                  placeholder="Qty"
                />
              </div>
              <div className="grid gap-2">
                <Label>Weight</Label>
                <Input
                  value={challanData.weight}
                  onChange={(e) => setChallanData({...challanData, weight: e.target.value})}
                  placeholder="Weight"
                />
              </div>
              <div className="grid gap-2">
                <Label>Units</Label>
                <Input
                  value={challanData.units}
                  onChange={(e) => setChallanData({...challanData, units: e.target.value})}
                  placeholder="kg, pcs, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transport Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Truck/Vehicle Number</Label>
                <Input
                  value={challanData.truckNumber}
                  onChange={(e) => setChallanData({...challanData, truckNumber: e.target.value})}
                  placeholder="Vehicle registration"
                />
              </div>
              <div className="grid gap-2">
                <Label>Driver Name</Label>
                <Input
                  value={challanData.driverName}
                  onChange={(e) => setChallanData({...challanData, driverName: e.target.value})}
                  placeholder="Driver's name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Courier Service</Label>
                <Input
                  value={challanData.courierService}
                  onChange={(e) => setChallanData({...challanData, courierService: e.target.value})}
                  placeholder="Courier company"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Challan
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