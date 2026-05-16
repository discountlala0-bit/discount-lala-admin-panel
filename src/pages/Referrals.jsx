import { useQuery } from '@tanstack/react-query'
import { getAllReferrals } from '@/api/referrals'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'

export default function Referrals() {
  const { data, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => getAllReferrals(),
  })
  const referrals = data?.data ?? []

  return (
    <div>
      <PageHeader title="Referrals" description="All referral activity on the platform" />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referrer</TableHead>
              <TableHead>Referred User</TableHead>
              <TableHead>Reward Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}</TableRow>)
            ) : referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  No referral records yet.
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.referrer?.name ?? r.referrer?.phoneNumber ?? '—'}</TableCell>
                  <TableCell>{r.referredUser?.name ?? r.referredUser?.phoneNumber ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={r.rewardStatus} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
