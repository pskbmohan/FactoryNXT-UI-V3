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

const stationSchema = z.object({
  line_id: z.string().min(1, 'Line is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  station_type: z.string().min(1, 'Station type is required'),
  sequence: z.coerce.number().min(0, 'Sequence must be >= 0'),
});

type StationFormData = z.infer<typeof stationSchema>;

export function Stations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);

  const { data: stations, isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: () => apiClient.get('/stations').then(res => res.data),
  });

  const { data: lines } = useQuery({
    queryKey: ['lines-select'],
    queryFn: () => apiClient.get('/lines').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(stationSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: StationFormData) => apiClient.post('/stations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StationFormData }) =>
      apiClient.put(`/stations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setDialogOpen(false);
      setEditingStation(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/stations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  const onSubmit = (data: StationFormData) => {
    if (editingStation) {
      updateMutation.mutate({ id: editingStation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (station: any) => {
    setEditingStation(station);
    reset(station);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this station?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stations</h1>
          <p className="text-muted-foreground">Manage work stations on production lines</p>
        </div>
        <Button onClick={() => { setEditingStation(null); reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Station
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations?.map((station: any) => (
                <TableRow key={station.id}>
                  <TableCell>{station.sequence}</TableCell>
                  <TableCell className="font-medium">{station.code}</TableCell>
                  <TableCell>{station.name}</TableCell>
                  <TableCell>{station.line_code}</TableCell>
                  <TableCell>{station.station_type}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(station)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(station.id)}>
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
            <DialogTitle>{editingStation ? 'Edit Station' : 'Add Station'}</DialogTitle>
            <DialogDescription>
              {editingStation ? 'Update station information' : 'Create a new work station'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line_id">Line</Label>
              <Select
                onValueChange={(value) => setValue('line_id', value)}
                defaultValue={editingStation?.line_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a line" />
                </SelectTrigger>
                <SelectContent>
                  {lines?.map((line: any) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.line_id && <p className="text-sm text-destructive">{errors.line_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sequence">Sequence</Label>
              <Input id="sequence" type="number" {...register('sequence')} />
              {errors.sequence && <p className="text-sm text-destructive">{errors.sequence.message}</p>}
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
              <Label htmlFor="station_type">Station Type</Label>
              <Select
                onValueChange={(value) => setValue('station_type', value)}
                defaultValue={editingStation?.station_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select station type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOAD">Load</SelectItem>
                  <SelectItem value="SOLDER_PASTE_PRINT">Solder Paste Print</SelectItem>
                  <SelectItem value="SMT_PLACE">SMT Place</SelectItem>
                  <SelectItem value="REFLOW">Reflow</SelectItem>
                  <SelectItem value="AOI">AOI</SelectItem>
                  <SelectItem value="MANUAL_ASSEMBLY">Manual Assembly</SelectItem>
                  <SelectItem value="TEST">Test</SelectItem>
                  <SelectItem value="PACK">Pack</SelectItem>
                </SelectContent>
              </Select>
              {errors.station_type && <p className="text-sm text-destructive">{errors.station_type.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingStation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
