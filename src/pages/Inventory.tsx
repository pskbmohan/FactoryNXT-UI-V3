import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

const inventorySchema = z.object({
  plant_id: z.string().min(1, 'Plant is required'),
  material_id: z.string().min(1, 'Material ID is required'),
  lot_number: z.string().min(1, 'Lot number is required'),
  quantity_available: z.coerce.number().min(0, 'Quantity must be >= 0'),
  location: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export function Inventory() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get('/smt/inventory').then(res => res.data),
  });

  const { data: plants } = useQuery({
    queryKey: ['plants-inventory'],
    queryFn: () => apiClient.get('/plants').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: InventoryFormData) => apiClient.post('/smt/inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryFormData }) =>
      apiClient.put(`/smt/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDialogOpen(false);
      setEditingItem(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/smt/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    reset(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold tracking-tight">SMT Inventory</h1>
          <p className="text-muted-foreground">Track material inventory and lots</p>
        </div>
        <Button onClick={() => { setEditingItem(null); reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material ID</TableHead>
                <TableHead>Lot Number</TableHead>
                <TableHead>Plant</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.material_id}</TableCell>
                  <TableCell>{item.lot_number}</TableCell>
                  <TableCell>{item.plant_code}</TableCell>
                  <TableCell>{item.quantity_available}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.expiry_date || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Inventory' : 'Add Inventory'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update inventory information' : 'Add new inventory item'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plant_id">Plant</Label>
              <Select
                onValueChange={(value) => setValue('plant_id', value)}
                defaultValue={editingItem?.plant_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plant" />
                </SelectTrigger>
                <SelectContent>
                  {plants?.map((plant: any) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plant_id && <p className="text-sm text-destructive">{errors.plant_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="material_id">Material ID</Label>
              <Input id="material_id" {...register('material_id')} />
              {errors.material_id && <p className="text-sm text-destructive">{errors.material_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot_number">Lot Number</Label>
              <Input id="lot_number" {...register('lot_number')} />
              {errors.lot_number && <p className="text-sm text-destructive">{errors.lot_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity_available">Quantity Available</Label>
              <Input id="quantity_available" type="number" {...register('quantity_available')} />
              {errors.quantity_available && <p className="text-sm text-destructive">{errors.quantity_available.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue('status', value)}
                defaultValue={editingItem?.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
