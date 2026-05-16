import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getOffers, createOffer, updateOffer, deleteOffer } from '@/api/offers'
import { getPlaces } from '@/api/places'
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
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  timing: z.string().optional(),
  max_people: z.coerce.number().int().min(1).optional(),
  place_id: z.string().min(1, 'Place is required'),
  offer_type: z.enum(['booklet', 'add_on']),
  status: z.enum(['active', 'inactive']),
})

function OfferForm({ defaultValues, places, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { offer_type: 'add_on', status: 'active', ...defaultValues, place_id: defaultValues?.placeId ?? defaultValues?.place_id ?? '' },
  })
  const status = watch('status')
  const offer_type = watch('offer_type')
  const place_id = watch('place_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input {...register('title')} placeholder="50% off on starters" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} placeholder="Offer details..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input {...register('price')} type="number" placeholder="0" />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Max People</Label>
          <Input {...register('max_people')} type="number" placeholder="4" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Timing</Label>
        <Input {...register('timing')} placeholder="Mon–Fri 12pm–3pm" />
      </div>
      <div className="space-y-2">
        <Label>Place</Label>
        <Select value={place_id} onValueChange={(v) => setValue('place_id', v)}>
          <SelectTrigger><SelectValue placeholder="Select place" /></SelectTrigger>
          <SelectContent>
            {places.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.place_id && <p className="text-xs text-destructive">{errors.place_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Offer Type</Label>
        <Select value={offer_type} onValueChange={(v) => setValue('offer_type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="booklet">Booklet</SelectItem>
            <SelectItem value="add_on">Add-On</SelectItem>
          </SelectContent>
        </Select>
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

export default function Offers() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['offers'], queryFn: () => getOffers() })
  const { data: placesData } = useQuery({ queryKey: ['places'], queryFn: () => getPlaces() })
  const offers = data?.data ?? []
  const places = placesData?.data ?? []

  const createMut = useMutation({
    mutationFn: createOffer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offers'] }); setSheetOpen(false); toast.success('Offer created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateOffer(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offers'] }); setSheetOpen(false); toast.success('Offer updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offers'] }); setDeleteTarget(null); toast.success('Offer deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Offers"
        description="Individual discount offers linked to places"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Offer</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Place</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>
              ))
            ) : offers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No offers yet.</TableCell></TableRow>
            ) : (
              offers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium max-w-48 truncate">{o.title}</TableCell>
                  <TableCell className="text-sm">{o.place?.name ?? '—'}</TableCell>
                  <TableCell>₹{o.price}</TableCell>
                  <TableCell className="text-sm capitalize">{o.offerType?.replace(/_/g, ' ') ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(o); setSheetOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(o)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          <SheetHeader><SheetTitle>{editing ? 'Edit Offer' : 'Add Offer'}</SheetTitle></SheetHeader>
          <div className="mt-6">
            <OfferForm key={editing?.id ?? 'new'} defaultValues={editing} places={places} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Offer" description={`Delete "${deleteTarget?.title}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
