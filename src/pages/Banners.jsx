import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/api/banners'
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
  image: z.string().url('Must be a valid URL').min(1, 'Image URL required'),
  redirect_type: z.enum(['booklet', 'add_on', 'offer', 'none']),
  redirect_id: z.string().optional(),
  priority: z.coerce.number().int().min(0),
  status: z.enum(['active', 'inactive']),
})

function BannerForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      redirect_type: 'none',
      priority: 0,
      status: 'active',
      ...defaultValues,
      redirect_type: defaultValues?.redirectType ?? defaultValues?.redirect_type ?? 'none',
      redirect_id: defaultValues?.redirectId ?? defaultValues?.redirect_id ?? '',
    },
  })
  const status = watch('status')
  const redirect_type = watch('redirect_type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input {...register('image')} placeholder="https://..." />
        {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Redirect Type</Label>
        <Select value={redirect_type} onValueChange={(v) => setValue('redirect_type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="booklet">Booklet</SelectItem>
            <SelectItem value="add_on">Add-On</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {redirect_type !== 'none' && (
        <div className="space-y-2">
          <Label>Redirect ID</Label>
          <Input {...register('redirect_id')} placeholder="ID of booklet/add-on/offer" />
        </div>
      )}
      <div className="space-y-2">
        <Label>Priority</Label>
        <Input {...register('priority')} type="number" placeholder="0" />
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

export default function Banners() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['banners'], queryFn: () => getBanners() })
  const banners = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createBanner,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); setSheetOpen(false); toast.success('Banner created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateBanner(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); setSheetOpen(false); toast.success('Banner updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); setDeleteTarget(null); toast.success('Banner deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Promotional banners shown on the home screen"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Banner</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Redirect Type</TableHead>
              <TableHead>Redirect ID</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : banners.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No banners yet.</TableCell></TableRow>
            ) : (
              banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img src={b.image} alt="banner" className="h-10 w-20 object-cover rounded" onError={(e) => { e.target.style.display = 'none' }} />
                  </TableCell>
                  <TableCell className="capitalize">{b.redirectType?.replace(/_/g, ' ') ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.redirectId ?? '—'}</TableCell>
                  <TableCell>{b.priority}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(b); setSheetOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(b)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          <SheetHeader><SheetTitle>{editing ? 'Edit Banner' : 'Add Banner'}</SheetTitle></SheetHeader>
          <div className="mt-6">
            <BannerForm key={editing?.id ?? 'new'} defaultValues={editing} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Banner" description="Delete this banner? This cannot be undone."
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
