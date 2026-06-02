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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const plantSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

type PlantFormData = z.infer<typeof plantSchema>;

export function Plants() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<any>(null);

  const { data: plants, isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => apiClient.get('/plants').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: PlantFormData) => apiClient.post('/plants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlantFormData }) =>
      apiClient.put(`/plants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setDialogOpen(false);
      setEditingPlant(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/plants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });

  const onSubmit = (data: PlantFormData) => {
    if (editingPlant) {
      updateMutation.mutate({ id: editingPlant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (plant: any) => {
    setEditingPlant(plant);
    reset(plant);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this plant?')) {
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
          <h1 className="text-3xl font-bold tracking-tight">Plants</h1>
          <p className="text-muted-foreground">Manage manufacturing plants</p>
        </div>
        <Button onClick={() => { setEditingPlant(null); reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plant
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plants?.map((plant: any) => (
                <TableRow key={plant.id}>
                  <TableCell className="font-medium">{plant.code}</TableCell>
                  <TableCell>{plant.name}</TableCell>
                  <TableCell>{plant.location}</TableCell>
                  <TableCell>{plant.timezone}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(plant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plant.id)}
                    >
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
            <DialogTitle>{editingPlant ? 'Edit Plant' : 'Add Plant'}</DialogTitle>
            <DialogDescription>
              {editingPlant ? 'Update plant information' : 'Create a new manufacturing plant'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...register('timezone')} placeholder="America/New_York" />
              {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPlant ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
