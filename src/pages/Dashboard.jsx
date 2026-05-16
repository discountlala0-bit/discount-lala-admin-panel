import { useQueries } from '@tanstack/react-query'
import { getCities } from '@/api/cities'
import { getOrders } from '@/api/orders'
import { getDistributors } from '@/api/distributors'
import { getDeactivatedUsers } from '@/api/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import { MapPin, ShoppingBag, Truck, Users } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function StatCard({ title, value, icon: Icon, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['cities'], queryFn: () => getCities() },
      { queryKey: ['orders'], queryFn: () => getOrders() },
      { queryKey: ['distributors'], queryFn: () => getDistributors() },
      { queryKey: ['deactivated-users'], queryFn: () => getDeactivatedUsers() },
    ],
  })

  const [citiesQ, ordersQ, distributorsQ, usersQ] = results
  const isLoading = results.some((r) => r.isLoading)

  const cities = citiesQ.data?.data ?? []
  const orders = ordersQ.data?.data ?? []
  const distributors = distributorsQ.data?.data ?? []
  const deactivatedUsers = usersQ.data?.data ?? []

  const recentOrders = [...orders].slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cities" value={cities.length} icon={MapPin} loading={isLoading} />
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} loading={isLoading} />
        <StatCard title="Distributors" value={distributors.length} icon={Truck} loading={isLoading} />
        <StatCard title="Deactivated Users" value={deactivatedUsers.length} icon={Users} loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>₹{order.totalAmount}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
