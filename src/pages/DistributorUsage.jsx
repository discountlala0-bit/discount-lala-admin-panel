import { useQuery } from '@tanstack/react-query'
import { getRedemptions } from '@/api/distributors'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import SearchInput from '@/components/shared/SearchInput'
import DataPagination from '@/components/shared/DataPagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'

export default function DistributorUsage() {
  const { data, isLoading } = useQuery({
    queryKey: ['distributor-redemptions'],
    queryFn: () => getRedemptions(),
  })
  const redemptions = data?.data ?? []
  const paginated = usePaginatedList(redemptions, {
    searchKeys: ['distributor.name', 'user.name', 'user.phoneNumber'],
  })

  return (
    <div>
      <PageHeader title="Distributor Usage" description="Which customers used which distributor's code, and the discount given" />
      <div className="mb-4">
        <SearchInput value={paginated.search} onChange={paginated.setSearch} placeholder="Search by distributor or customer..." />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Distributor</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Discount Given</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : redemptions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No distributor codes have been used yet.</TableCell></TableRow>
            ) : paginated.pageItems.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No results match your search.</TableCell></TableRow>
            ) : (
              paginated.pageItems.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.distributor?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{o.user?.name ?? o.user?.phoneNumber ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-green-600">₹{o.discountAmount}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataPagination
        page={paginated.page}
        totalPages={paginated.totalPages}
        totalCount={paginated.totalCount}
        onPageChange={paginated.setPage}
      />
    </div>
  )
}
