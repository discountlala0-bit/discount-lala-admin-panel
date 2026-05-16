import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getCities, createCity, updateCity, deleteCity } from '@/api/cities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  name: z.string().min(1, 'City name is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  status: z.enum(['active', 'inactive']),
})

function CityForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { country: 'India', status: 'active', ...defaultValues },
  })
  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>City Name</Label>
        <Input {...register('name')} placeholder="Mumbai" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <Input {...register('state')} placeholder="Maharashtra" />
        {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Country</Label>
        <Input {...register('country')} placeholder="India" />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setValue('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SheetFooter>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </SheetFooter>
    </form>
  )
}

export default function Cities() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => getCities(),
  })
  const cities = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createCity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cities'] }); setSheetOpen(false); toast.success('City created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create city'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateCity(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cities'] }); setSheetOpen(false); toast.success('City updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update city'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cities'] }); setDeleteTarget(null); toast.success('City deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete city'),
  })

  const openCreate = () => { setEditing(null); setSheetOpen(true) }
  const openEdit = (city) => { setEditing(city); setSheetOpen(true) }

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  const mutLoading = createMut.isPending || updateMut.isPending

  return (
    <div>
      <PageHeader
        title="Cities"
        description="Manage cities where booklets are available"
        action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add City</Button>}
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No cities found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.state}</TableCell>
                  <TableCell>{city.country}</TableCell>
                  <TableCell><StatusBadge status={city.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(city)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(city)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit City' : 'Add City'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CityForm
              key={editing?.id ?? 'new'}
              defaultValues={editing}
              onSubmit={handleSubmit}
              loading={mutLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete City"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
      />
    </div>
  )
}
