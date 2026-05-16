import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getOrders, updateOrderStatus } from '@/api/orders'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'

const ORDER_STATUSES = ['pending', 'confirmed', 'completed', 'delivered', 'cancelled']

function OrderDetailDialog({ order, open, onOpenChange }) {
  const qc = useQueryClient()
  const updateMut = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Status updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
              <p className="font-semibold text-lg">₹{order.totalAmount}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select
                value={order.status}
                onValueChange={(status) => updateMut.mutate({ id: order.id, status })}
                disabled={updateMut.isPending}
              >
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {order.items?.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Items</p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.itemType?.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="font-mono text-xs">{item.itemId}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {order.payments?.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Payments</p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                        <TableCell><StatusBadge status={p.paymentStatus} /></TableCell>
                        <TableCell className="font-mono text-xs">{p.transactionId ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => getOrders() })
  const orders = data?.data ?? []

  return (
    <div>
      <PageHeader title="Orders" description="All customer orders" />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No orders yet.</TableCell></TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(o)}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm">{o.user?.name ?? o.user?.phoneNumber ?? '—'}</TableCell>
                  <TableCell className="font-medium">₹{o.totalAmount}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(v) => !v && setSelectedOrder(null)}
      />
    </div>
  )
}
