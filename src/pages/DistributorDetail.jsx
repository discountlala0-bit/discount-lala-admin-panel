import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDistributorById } from '@/api/distributors'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'

export default function DistributorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['distributor', id],
    queryFn: () => getDistributorById(id),
  })
  const distributor = data?.data
  const orders = distributor?.orders ?? []

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/distributors')}>
        <ArrowLeft className="mr-2 h-4 w-4" />Back to Distributors
      </Button>

      {isLoading ? (
        <Skeleton className="h-24 w-full mb-6" />
      ) : !distributor ? (
        <p className="text-muted-foreground">Distributor not found.</p>
      ) : (
        <>
          <PageHeader
            title={distributor.name}
            description={`Referral code ${distributor.referralCode} — ${distributor.discountPercentage}% discount on booklet purchases`}
          />

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{distributor.phone}</p>
            </div>
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{distributor.email ?? '—'}</p>
            </div>
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs text-muted-foreground">Customers Using Code</p>
              <p className="font-medium">{orders.length}</p>
            </div>
          </div>

          <h2 className="text-sm font-semibold mb-2">Customers who used this code</h2>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Discount Given</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No customers have used this code yet.</TableCell></TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.user?.name ?? o.user?.phoneNumber ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {o.items?.map((i) => i.itemType.replace(/_/g, ' ')).join(', ') || '—'}
                      </TableCell>
                      <TableCell>₹{o.totalAmount}</TableCell>
                      <TableCell className="text-green-600">₹{o.discountAmount}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
