import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getBooklets, getBookletById, createBooklet, updateBooklet, deleteBooklet } from '@/api/booklets'
import { getCities } from '@/api/cities'
import { getOffers, addOfferToBooklet, removeOfferFromBooklet } from '@/api/offers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2, List } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  city_id: z.string().min(1, 'City is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  validity: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

function BookletForm({ defaultValues, cities, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', ...defaultValues, city_id: defaultValues?.cityId ?? defaultValues?.city_id ?? '' },
  })
  const status = watch('status')
  const city_id = watch('city_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>City</Label>
        <Select value={city_id} onValueChange={(v) => setValue('city_id', v)}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {cities.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.city_id && <p className="text-xs text-destructive">{errors.city_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input {...register('title')} placeholder="Mumbai Booklet 2025" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input {...register('price')} type="number" placeholder="499" />
        </div>
        <div className="space-y-2">
          <Label>Validity</Label>
          <Input {...register('validity')} placeholder="1 year" />
        </div>
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

function OffersDialog({ booklet, open, onOpenChange }) {
  const qc = useQueryClient()
  const [selectedOffer, setSelectedOffer] = useState('')

  const { data: bookletData, isLoading } = useQuery({
    queryKey: ['booklet', booklet?.id],
    queryFn: () => getBookletById(booklet.id),
    enabled: !!booklet,
  })
  const { data: allOffersData } = useQuery({ queryKey: ['offers'], queryFn: () => getOffers() })

  const linkedOffers = bookletData?.data?.bookletOffers?.map((bo) => bo.offer) ?? []
  const allOffers = allOffersData?.data ?? []
  const linkedIds = new Set(linkedOffers.map((o) => String(o.id)))
  // backend validates offer must have offerType === 'booklet'
  const unlinked = allOffers.filter((o) => o.offerType === 'booklet' && !linkedIds.has(String(o.id)))

  const addMut = useMutation({
    mutationFn: ({ booklet_id, offer_id }) => addOfferToBooklet(booklet_id, offer_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklet', booklet.id] }); setSelectedOffer(''); toast.success('Offer added') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const removeMut = useMutation({
    mutationFn: ({ booklet_id, offer_id }) => removeOfferFromBooklet(booklet_id, offer_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklet', booklet.id] }); toast.success('Offer removed') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Offers — {booklet?.title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Select value={selectedOffer} onValueChange={setSelectedOffer}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select offer to add" /></SelectTrigger>
            <SelectContent>
              {unlinked.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedOffer || addMut.isPending}
            onClick={() => addMut.mutate({ booklet_id: booklet.id, offer_id: selectedOffer })}
          >
            {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-2 rounded-md border max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-4 w-full" /></TableCell></TableRow>)
              ) : linkedOffers.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No offers linked</TableCell></TableRow>
              ) : (
                linkedOffers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.title}</TableCell>
                    <TableCell>₹{o.price}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeMut.mutate({ booklet_id: booklet.id, offer_id: o.id })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Booklets() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [offersTarget, setOffersTarget] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['booklets'], queryFn: () => getBooklets() })
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => getCities() })
  const booklets = data?.data ?? []
  const cities = citiesData?.data ?? []

  const createMut = useMutation({
    mutationFn: createBooklet,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklets'] }); setSheetOpen(false); toast.success('Booklet created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateBooklet(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklets'] }); setSheetOpen(false); toast.success('Booklet updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteBooklet,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklets'] }); setDeleteTarget(null); toast.success('Booklet deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Booklets"
        description="Discount booklets available per city"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Booklet</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : booklets.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No booklets yet.</TableCell></TableRow>
            ) : (
              booklets.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.city?.name ?? '—'}</TableCell>
                  <TableCell>₹{b.price}</TableCell>
                  <TableCell>{b.validity ?? '—'}</TableCell>
                  <TableCell>{b.bookletOffers?.length ?? 0}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOffersTarget(b)}><List className="mr-2 h-4 w-4" />Manage Offers</DropdownMenuItem>
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
          <SheetHeader><SheetTitle>{editing ? 'Edit Booklet' : 'Add Booklet'}</SheetTitle></SheetHeader>
          <div className="px-4 pb-2">
            <BookletForm key={editing?.id ?? 'new'} defaultValues={editing} cities={cities} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
      <OffersDialog booklet={offersTarget} open={!!offersTarget} onOpenChange={(v) => !v && setOffersTarget(null)} />
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Booklet" description={`Delete "${deleteTarget?.title}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
