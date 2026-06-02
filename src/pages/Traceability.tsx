import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function Traceability() {
  const [serialNumber, setSerialNumber] = useState('');
  const [searchedSerial, setSearchedSerial] = useState('');

  const { data: genealogy, isLoading, refetch } = useQuery({
    queryKey: ['genealogy', searchedSerial],
    queryFn: () => apiClient.get(`/traceability/genealogy/${searchedSerial}`).then(res => res.data),
    enabled: !!searchedSerial,
  });

  const handleSearch = () => {
    if (serialNumber) {
      setSearchedSerial(serialNumber);
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Traceability</h1>
        <p className="text-muted-foreground">Track unit history and genealogy</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="serial" className="sr-only">Serial Number</Label>
              <Input
                id="serial"
                placeholder="Enter unit serial number..."
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !serialNumber}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center py-8">Loading...</div>}

      {genealogy && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-sm">{genealogy.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                  <p className="text-sm">{genealogy.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Part Number</p>
                  <p className="text-sm">{genealogy.part_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(genealogy.status)}>
                    {genealogy.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Station History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Scan Type</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {genealogy.station_history?.map((scan: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{scan.station_code}</TableCell>
                      <TableCell>{scan.scan_type}</TableCell>
                      <TableCell>{scan.operator_username}</TableCell>
                      <TableCell>{new Date(scan.scanned_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defect History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Defect Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {genealogy.defect_history?.map((defect: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{defect.station_code}</TableCell>
                      <TableCell>{defect.defect_code}</TableCell>
                      <TableCell>{defect.description}</TableCell>
                      <TableCell>
                        <Badge className={
                          defect.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          defect.severity === 'MAJOR' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {defect.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(defect.recorded_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
