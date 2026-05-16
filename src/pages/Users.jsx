import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDeactivatedUsers, reactivateUser } from '@/api/users'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { UserCheck, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

function ReactivateButton({ userId }) {
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => reactivateUser(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deactivated-users'] }); toast.success('User reactivated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  return (
    <Button size="sm" variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending}>
      {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
      Reactivate
    </Button>
  )
}

export default function Users() {
  const { data, isLoading } = useQuery({
    queryKey: ['deactivated-users'],
    queryFn: () => getDeactivatedUsers(),
  })
  const users = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Users"
        description="Deactivated accounts that can be reactivated"
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Deactivated</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}</TableRow>)
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No deactivated users.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? '—'}</TableCell>
                  <TableCell>{u.phoneNumber}</TableCell>
                  <TableCell>{u.email ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.deactivatedAt ? new Date(u.deactivatedAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell><ReactivateButton userId={u.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
