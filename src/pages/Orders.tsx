import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Orders() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/orders').then(res => res.data),
  });

  const filteredOrders = orders?.filter((order: any) =>
    order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    order.part_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Orders</h1>
          <p className="text-muted-foreground">Track and manage production orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by order number or part number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.part_number}</TableCell>
                  <TableCell>
                    {order.quantity_completed} / {order.quantity_ordered}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.planned_start}</TableCell>
                  <TableCell>{order.planned_end}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Complete information about this production order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                  <p className="text-sm">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Part Number</p>
                  <p className="text-sm">{selectedOrder.part_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity Ordered</p>
                  <p className="text-sm">{selectedOrder.quantity_ordered}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity Completed</p>
                  <p className="text-sm">{selectedOrder.quantity_completed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plant</p>
                  <p className="text-sm">{selectedOrder.plant_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Line</p>
                  <p className="text-sm">{selectedOrder.line_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="text-sm">{selectedOrder.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planned Start</p>
                  <p className="text-sm">{selectedOrder.planned_start}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planned End</p>
                  <p className="text-sm">{selectedOrder.planned_end}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
