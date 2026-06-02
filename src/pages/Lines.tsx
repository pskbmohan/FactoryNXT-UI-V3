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

const lineSchema = z.object({
  plant_id: z.string().min(1, 'Plant is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  line_type: z.string().min(1, 'Line type is required'),
});

type LineFormData = z.infer<typeof lineSchema>;

export function Lines() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<any>(null);

  const { data: lines, isLoading } = useQuery({
    queryKey: ['lines'],
    queryFn: () => apiClient.get('/lines').then(res => res.data),
  });

  const { data: plants } = useQuery({
    queryKey: ['plants-select'],
    queryFn: () => apiClient.get('/plants').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LineFormData>({
    resolver: zodResolver(lineSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: LineFormData) => apiClient.post('/lines', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LineFormData }) =>
      apiClient.put(`/lines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      setDialogOpen(false);
      setEditingLine(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/lines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
    },
  });

  const onSubmit = (data: LineFormData) => {
    if (editingLine) {
      updateMutation.mutate({ id: editingLine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (line: any) => {
    setEditingLine(line);
    reset(line);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this line?')) {
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
          <h1 className="text-3xl font-bold tracking-tight">Production Lines</h1>
          <p className="text-muted-foreground">Manage production lines across plants</p>
        </div>
        <Button onClick={() => { setEditingLine(null); reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Line
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell className="font-medium">{line.code}</TableCell>
                  <TableCell>{line.name}</TableCell>
                  <TableCell>{line.plant_code}</TableCell>
                  <TableCell>{line.line_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      line.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {line.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(line)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(line.id)}>
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
            <DialogTitle>{editingLine ? 'Edit Line' : 'Add Line'}</DialogTitle>
            <DialogDescription>
              {editingLine ? 'Update production line information' : 'Create a new production line'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plant_id">Plant</Label>
              <Select
                onValueChange={(value) => setValue('plant_id', value)}
                defaultValue={editingLine?.plant_id}
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
              <Label htmlFor="line_type">Line Type</Label>
              <Select
                onValueChange={(value) => setValue('line_type', value)}
                defaultValue={editingLine?.line_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select line type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMT">SMT</SelectItem>
                  <SelectItem value="THT">THT</SelectItem>
                  <SelectItem value="ASSEMBLY">Assembly</SelectItem>
                  <SelectItem value="TEST">Test</SelectItem>
                </SelectContent>
              </Select>
              {errors.line_type && <p className="text-sm text-destructive">{errors.line_type.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingLine ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
