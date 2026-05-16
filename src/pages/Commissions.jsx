import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getCommissions, updateCommissionStatus } from '@/api/distributors'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'

function MarkPaidButton({ commission }) {
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => updateCommissionStatus(commission.id, 'paid'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['commissions'] }); toast.success('Commission marked as paid') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  if (commission.status === 'paid') return null
  return (
    <Button size="sm" variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending}>
      {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
      Mark Paid
    </Button>
  )
}

export default function Commissions() {
  const { data, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => getCommissions(),
  })
  const commissions = data?.data ?? []

  return (
    <div>
      <PageHeader title="Commissions" description="Distributor commission records" />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Distributor</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : commissions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No commission records.</TableCell></TableRow>
            ) : (
              commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.distributor?.name ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{c.orderId?.slice(0, 8)}…</TableCell>
                  <TableCell>₹{c.commissionAmount}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell><MarkPaidButton commission={c} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
