import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ncrSchema = z.object({
  order_id: z.string().min(1, 'Order is required'),
  unit_serial: z.string().min(1, 'Unit serial is required'),
  defect_code: z.string().min(1, 'Defect code is required'),
  severity: z.string().min(1, 'Severity is required'),
  description: z.string().min(1, 'Description is required'),
});

type NCRFormData = z.infer<typeof ncrSchema>;

export function NCR() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNCR, setSelectedNCR] = useState<any>(null);

  const { data: ncrs, isLoading } = useQuery({
    queryKey: ['ncrs'],
    queryFn: () => apiClient.get('/quality/ncr').then(res => res.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['orders-ncr'],
    queryFn: () => apiClient.get('/orders').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NCRFormData>({
    resolver: zodResolver(ncrSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: NCRFormData) => apiClient.post('/quality/ncr', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncrs'] });
      setCreateDialogOpen(false);
      reset();
    },
  });

  const onSubmit = (data: NCRFormData) => {
    createMutation.mutate(data);
  };

  const handleView = (ncr: any) => {
    setSelectedNCR(ncr);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'INVESTIGATING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'MAJOR':
        return 'bg-orange-100 text-orange-800';
      case 'MINOR':
        return 'bg-yellow-100 text-yellow-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Non-Conformance Reports</h1>
          <p className="text-muted-foreground">Track and manage quality issues</p>
        </div>
        <Button onClick={() => { reset(); setCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create NCR
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NCR Number</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Unit Serial</TableHead>
                <TableHead>Defect Code</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ncrs?.map((ncr: any) => (
                <TableRow key={ncr.id}>
                  <TableCell className="font-medium">{ncr.ncr_number}</TableCell>
                  <TableCell>{ncr.order_number}</TableCell>
                  <TableCell>{ncr.unit_serial}</TableCell>
                  <TableCell>{ncr.defect_code}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(ncr.severity)}>
                      {ncr.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ncr.status)}>
                      {ncr.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ncr.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(ncr)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>NCR Details: {selectedNCR?.ncr_number}</DialogTitle>
            <DialogDescription>
              Complete information about this non-conformance report
            </DialogDescription>
          </DialogHeader>
          {selectedNCR && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NCR Number</p>
                  <p className="text-sm">{selectedNCR.ncr_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order</p>
                  <p className="text-sm">{selectedNCR.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit Serial</p>
                  <p className="text-sm">{selectedNCR.unit_serial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Defect Code</p>
                  <p className="text-sm">{selectedNCR.defect_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Severity</p>
                  <Badge className={getSeverityColor(selectedNCR.severity)}>
                    {selectedNCR.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedNCR.status)}>
                    {selectedNCR.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedNCR.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p className="text-sm">{selectedNCR.created_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{new Date(selectedNCR.created_at).toLocaleString()}</p>
                </div>
                {selectedNCR.resolution && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Resolution</p>
                    <p className="text-sm">{selectedNCR.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create NCR</DialogTitle>
            <DialogDescription>
              Report a new non-conformance issue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order_id">Order</Label>
              <Select
                onValueChange={(value) => setValue('order_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.map((order: any) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.order_id && <p className="text-sm text-destructive">{errors.order_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_serial">Unit Serial</Label>
              <Input id="unit_serial" {...register('unit_serial')} />
              {errors.unit_serial && <p className="text-sm text-destructive">{errors.unit_serial.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="defect_code">Defect Code</Label>
              <Input id="defect_code" {...register('defect_code')} />
              {errors.defect_code && <p className="text-sm text-destructive">{errors.defect_code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                onValueChange={(value) => setValue('severity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="MAJOR">Major</SelectItem>
                  <SelectItem value="MINOR">Minor</SelectItem>
                </SelectContent>
              </Select>
              {errors.severity && <p className="text-sm text-destructive">{errors.severity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
