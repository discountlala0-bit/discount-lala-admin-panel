import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getDistributors, createDistributor, updateDistributor } from '@/api/distributors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email required'),
  commissionPercentage: z.coerce.number().min(0).max(100),
})

function DistributorForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register('name')} placeholder="John Doe" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input {...register('phone')} placeholder="+91..." />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input {...register('email')} type="email" placeholder="john@example.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Commission %</Label>
        <Input {...register('commissionPercentage')} type="number" placeholder="10" />
        {errors.commissionPercentage && <p className="text-xs text-destructive">{errors.commissionPercentage.message}</p>}
      </div>
      <SheetFooter>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
        </Button>
      </SheetFooter>
    </form>
  )
}

export default function Distributors() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['distributors'], queryFn: () => getDistributors() })
  const distributors = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createDistributor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['distributors'] }); setSheetOpen(false); toast.success('Distributor created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateDistributor(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['distributors'] }); setSheetOpen(false); toast.success('Distributor updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Distributors"
        description="Partner distributors who earn commissions"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Distributor</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : distributors.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No distributors yet.</TableCell></TableRow>
            ) : (
              distributors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell className="font-mono text-sm">{d.referralCode}</TableCell>
                  <TableCell>{d.commissionPercentage}%</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(d); setSheetOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editing ? 'Edit Distributor' : 'Add Distributor'}</SheetTitle></SheetHeader>
          <div className="mt-6">
            <DistributorForm key={editing?.id ?? 'new'} defaultValues={editing} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
