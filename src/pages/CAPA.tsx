import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export function CAPA() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCAPA, setSelectedCAPA] = useState<any>(null);

  const { data: capas, isLoading } = useQuery({
    queryKey: ['capas'],
    queryFn: () => apiClient.get('/quality/capa').then(res => res.data),
  });

  const handleView = (capa: any) => {
    setSelectedCAPA(capa);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CAPA</h1>
        <p className="text-muted-foreground">Corrective and Preventive Actions</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CAPA Number</TableHead>
                <TableHead>NCR</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capas?.map((capa: any) => (
                <TableRow key={capa.id}>
                  <TableCell className="font-medium">{capa.capa_number}</TableCell>
                  <TableCell>{capa.ncr_number}</TableCell>
                  <TableCell>{capa.title}</TableCell>
                  <TableCell>{capa.capa_type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(capa.status)}>
                      {capa.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{capa.due_date ? new Date(capa.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(capa)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>CAPA Details: {selectedCAPA?.capa_number}</DialogTitle>
            <DialogDescription>
              Complete information about this corrective/preventive action
            </DialogDescription>
          </DialogHeader>
          {selectedCAPA && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CAPA Number</p>
                  <p className="text-sm">{selectedCAPA.capa_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NCR</p>
                  <p className="text-sm">{selectedCAPA.ncr_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-sm">{selectedCAPA.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">{selectedCAPA.capa_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedCAPA.status)}>
                    {selectedCAPA.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="text-sm">{selectedCAPA.due_date ? new Date(selectedCAPA.due_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Root Cause</p>
                  <p className="text-sm">{selectedCAPA.root_cause}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Corrective Actions</p>
                  <p className="text-sm">{selectedCAPA.corrective_actions}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Preventive Actions</p>
                  <p className="text-sm">{selectedCAPA.preventive_actions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <p className="text-sm">{selectedCAPA.assigned_to}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{new Date(selectedCAPA.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
