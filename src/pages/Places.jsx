import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getPlaces, createPlace, updatePlace, deletePlace } from '@/api/places'
import { getCategories } from '@/api/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  name: z.string().min(1, 'Name is required'),
  category_id: z.string().min(1, 'Category is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

function PlaceForm({ defaultValues, categories, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', ...defaultValues, category_id: defaultValues?.categoryId ?? defaultValues?.category_id ?? '' },
  })
  const status = watch('status')
  const category_id = watch('category_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Place Name</Label>
        <Input {...register('name')} placeholder="McDonald's" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category_id} onValueChange={(v) => setValue('category_id', v)}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input {...register('address')} placeholder="123 Main St" />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input {...register('phone')} placeholder="+91..." />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} placeholder="About this place..." />
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
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
        </Button>
      </SheetFooter>
    </form>
  )
}

export default function Places() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['places'], queryFn: () => getPlaces() })
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const places = data?.data ?? []
  const categories = catData?.data ?? []

  const createMut = useMutation({
    mutationFn: createPlace,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['places'] }); setSheetOpen(false); toast.success('Place created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePlace(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['places'] }); setSheetOpen(false); toast.success('Place updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: deletePlace,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['places'] }); setDeleteTarget(null); toast.success('Place deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Places"
        description="Restaurants, shops and locations that offer discounts"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Place</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>
              ))
            ) : places.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No places yet.</TableCell></TableRow>
            ) : (
              places.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-40 truncate">{p.address ?? '—'}</TableCell>
                  <TableCell className="text-sm">{p.phone ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(p); setSheetOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(p)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Edit Place' : 'Add Place'}</SheetTitle></SheetHeader>
          <div className="mt-6">
            <PlaceForm key={editing?.id ?? 'new'} defaultValues={editing} categories={categories} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Place" description={`Delete "${deleteTarget?.name}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
