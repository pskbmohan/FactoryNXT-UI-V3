import { useQuery } from '@tanstack/react-query';
import { Factory, Package, ClipboardList, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export function Dashboard() {
  const { data: plants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => apiClient.get('/plants').then(res => res.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/orders').then(res => res.data),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get('/smt/inventory').then(res => res.data),
  });

  const { data: ncrs } = useQuery({
    queryKey: ['ncrs'],
    queryFn: () => apiClient.get('/quality/ncr').then(res => res.data),
  });

  const stats = [
    {
      name: 'Plants',
      value: plants?.length || 0,
      icon: Factory,
      color: 'text-blue-600',
    },
    {
      name: 'Active Orders',
      value: orders?.filter((o: any) => o.status === 'IN_PROGRESS').length || 0,
      icon: ClipboardList,
      color: 'text-green-600',
    },
    {
      name: 'Inventory Items',
      value: inventory?.length || 0,
      icon: Package,
      color: 'text-purple-600',
    },
    {
      name: 'Open NCRs',
      value: ncrs?.filter((n: any) => n.status === 'OPEN').length || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your manufacturing operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.part_number}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open NCRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ncrs?.filter((n: any) => n.status === 'OPEN').slice(0, 5).map((ncr: any) => (
                <div key={ncr.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{ncr.ncr_number}</p>
                    <p className="text-xs text-muted-foreground">{ncr.defect_code}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                    {ncr.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
