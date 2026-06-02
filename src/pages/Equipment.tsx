import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
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

const equipmentSchema = z.object({
  station_id: z.string().min(1, 'Station is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  equipment_type: z.string().min(1, 'Equipment type is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export function Equipment() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => apiClient.get('/equipment').then(res => res.data),
  });

  const { data: stations } = useQuery({
    queryKey: ['stations-select'],
    queryFn: () => apiClient.get('/stations').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: EquipmentFormData) => apiClient.post('/equipment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentFormData }) =>
      apiClient.put(`/equipment/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setDialogOpen(false);
      setEditingEquipment(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/equipment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const onSubmit = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (eq: any) => {
    setEditingEquipment(eq);
    reset(eq);
    setDialogOpen(true);
  };

  const handleView = (eq: any) => {
    setSelectedEquipment(eq);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DOWN':
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
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground">Manage equipment across stations</p>
        </div>
        <Button onClick={() => { setEditingEquipment(null); reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment?.map((eq: any) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.code}</TableCell>
                  <TableCell>{eq.name}</TableCell>
                  <TableCell>{eq.station_code}</TableCell>
                  <TableCell>{eq.equipment_type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(eq.status)}>
                      {eq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(eq)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(eq)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(eq.id)}>
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle>Equipment Details: {selectedEquipment?.code}</DialogTitle>
            <DialogDescription>
              Complete information about this equipment
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Code</p>
                  <p className="text-sm">{selectedEquipment.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedEquipment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipment Type</p>
                  <p className="text-sm">{selectedEquipment.equipment_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Station</p>
                  <p className="text-sm">{selectedEquipment.station_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedEquipment.status)}>
                    {selectedEquipment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="text-sm">{selectedEquipment.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-sm">{selectedEquipment.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-sm">{selectedEquipment.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                  <p className="text-sm">{selectedEquipment.last_maintenance_date || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Maintenance</p>
                  <p className="text-sm">{selectedEquipment.next_maintenance_date || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
            <DialogDescription>
              {editingEquipment ? 'Update equipment information' : 'Register new equipment'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="station_id">Station</Label>
              <Select
                onValueChange={(value) => setValue('station_id', value)}
                defaultValue={editingEquipment?.station_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations?.map((station: any) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.station_id && <p className="text-sm text-destructive">{errors.station_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...register('code')} />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_type">Equipment Type</Label>
              <Select
                onValueChange={(value) => setValue('equipment_type', value)}
                defaultValue={editingEquipment?.equipment_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRINTER">Printer</SelectItem>
                  <SelectItem value="PLACER">Placer</SelectItem>
                  <SelectItem value="OVEN">Oven</SelectItem>
                  <SelectItem value="AOI">AOI</SelectItem>
                  <SelectItem value="CONVEYOR">Conveyor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.equipment_type && <p className="text-sm text-destructive">{errors.equipment_type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...register('manufacturer')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input id="serial_number" {...register('serial_number')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEquipment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
