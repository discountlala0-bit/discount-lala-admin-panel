import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAllUsers, toggleUserStatus } from '@/api/users'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { UserCheck, UserX, Eye, Loader2, Users as UsersIcon } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import SearchInput from '@/components/shared/SearchInput'
import DataPagination from '@/components/shared/DataPagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import UserDetailsDialog from '@/components/users/UserDetailsDialog'

function ToggleStatusButton({ user }) {
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => toggleUserStatus(user.id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['deactivated-users'] })
      qc.invalidateQueries({ queryKey: ['user-details', user.id] })
      toast.success(res.message || 'User status updated')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update user status'),
  })

  return (
    <Button
      size="sm"
      variant={user.isActive ? 'outline-destructive' : 'outline'}
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      title={user.isActive ? 'Deactivate User' : 'Activate User'}
    >
      {mut.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : user.isActive ? (
        <>
          <UserX className="mr-1.5 h-3.5 w-3.5" />
          Deactivate
        </>
      ) : (
        <>
          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
          Activate
        </>
      )}
    </Button>
  )
}

export default function Users() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', statusFilter],
    queryFn: () =>
      getAllUsers({ status: statusFilter !== 'all' ? statusFilter : undefined }),
  })

  const users = data?.data ?? []
  const paginated = usePaginatedList(users, {
    searchKeys: ['name', 'phoneNumber', 'email'],
  })

  const handleOpenDetails = (id) => {
    setSelectedUserId(id)
    setDetailsOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Customer Management"
        description="View all registered users, purchase histories, booklet & add-on coupons, redemption logs, and status details"
      />

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
        <div className="flex bg-muted p-1 rounded-lg border gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'all'
                ? 'bg-background shadow-xs text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'active'
                ? 'bg-background shadow-xs text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('deactivated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'deactivated'
                ? 'bg-background shadow-xs text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Deactivated
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={paginated.search}
            onChange={paginated.setSearch}
            placeholder="Search by name, phone or email..."
          />
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-md border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booklet</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-center">Coupons</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No users found in database.
                </TableCell>
              </TableRow>
            ) : paginated.pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No users match "{paginated.search}".
                </TableCell>
              </TableRow>
            ) : (
              paginated.pageItems.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-foreground">{u.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.email || 'No Email'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'success' : 'destructive'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.hasBooklet ? (
                      <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 text-xs">
                        Has Booklet
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs">
                    {u._count?.orders ?? 0}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs">
                    {u._count?.userCoupons ?? 0}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenDetails(u.id)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <ToggleStatusButton user={u} />
                    </div>
                  </TableCell>
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

      {/* User Details Modal Dialog */}
      <UserDetailsDialog
        userId={selectedUserId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}
