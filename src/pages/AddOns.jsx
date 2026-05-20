import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getAddOns, getAddOnById, createAddOn, updateAddOn, deleteAddOn, addOfferToAddOn, removeOfferFromAddOn } from '@/api/addons'
import { getCities } from '@/api/cities'
import { getCategories } from '@/api/categories'
import { getOffers } from '@/api/offers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2, List, X } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ImageUpload from '@/components/shared/ImageUpload'

const schema = z.object({
  city_id: z.string().min(1, 'City is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  image: z.string().optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
})

function AddOnForm({ defaultValues, cities, categories, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
      image: '',
      categories: [],
      ...defaultValues,
      city_id: defaultValues?.cityId ?? defaultValues?.city_id ?? '',
      categories: defaultValues?.addOnCategories?.map((ac) => String(ac.categoryId ?? ac.category?.id)) ?? [],
    },
  })
  const status = watch('status')
  const city_id = watch('city_id')
  const image = watch('image')
  const selectedCategories = watch('categories') ?? []

  const toggleCategory = (id) => {
    const strId = String(id)
    const next = selectedCategories.includes(strId)
      ? selectedCategories.filter((c) => c !== strId)
      : [...selectedCategories, strId]
    setValue('categories', next)
  }

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
        <Input {...register('title')} placeholder="Weekend Add-On" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label>Price (₹)</Label>
        <Input {...register('price')} type="number" placeholder="199" />
      </div>
      <ImageUpload label="Add-On Cover Image" value={image} onChange={(url) => setValue('image', url)} />
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2 rounded-md border p-2 min-h-10">
          {categories.map((cat) => {
            const selected = selectedCategories.includes(String(cat.id))
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-full px-3 py-0.5 text-xs border transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
              >
                {cat.name}
              </button>
            )
          })}
          {categories.length === 0 && <span className="text-xs text-muted-foreground">No categories available</span>}
        </div>
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map((id) => {
              const cat = categories.find((c) => String(c.id) === id)
              return cat ? (
                <Badge key={id} variant="secondary" className="gap-1">
                  {cat.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(id)} />
                </Badge>
              ) : null
            })}
          </div>
        )}
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

function OffersDialog({ addOn, open, onOpenChange }) {
  const qc = useQueryClient()
  const [selectedOffer, setSelectedOffer] = useState('')

  const { data: addOnData, isLoading } = useQuery({
    queryKey: ['addon', addOn?.id],
    queryFn: () => getAddOnById(addOn.id),
    enabled: !!addOn,
  })
  const cityId = addOn?.cityId ?? addOn?.city_id ?? addOn?.city?.id
  const { data: allOffersData } = useQuery({
    queryKey: ['offers', { city_id: cityId }],
    queryFn: () => getOffers({ city_id: cityId }),
    enabled: !!addOn,
  })

  const linkedOffers = addOnData?.data?.addOnOffers?.map((ao) => ao.offer) ?? []
  const allOffers = allOffersData?.data ?? []
  const linkedIds = new Set(linkedOffers.map((o) => String(o.id)))
  const unlinked = allOffers.filter((o) =>
    o.offerType === 'add_on' &&
    !linkedIds.has(String(o.id)) &&
    (!o.addOnOffers || o.addOnOffers.length === 0)
  )

  const addMut = useMutation({
    mutationFn: ({ add_on_id, offer_id }) => addOfferToAddOn(add_on_id, offer_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addon', addOn.id] }); setSelectedOffer(''); toast.success('Offer added') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const removeMut = useMutation({
    mutationFn: ({ add_on_id, offer_id }) => removeOfferFromAddOn(add_on_id, offer_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addon', addOn.id] }); toast.success('Offer removed') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Manage Offers — {addOn?.title}</DialogTitle></DialogHeader>
        <div className="flex gap-2 mt-2">
          <Select value={selectedOffer} onValueChange={setSelectedOffer}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select offer to add" /></SelectTrigger>
            <SelectContent>
              {unlinked.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedOffer || addMut.isPending}
            onClick={() => addMut.mutate({ add_on_id: addOn.id, offer_id: selectedOffer })}
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
                      <Button variant="ghost" size="icon" onClick={() => removeMut.mutate({ add_on_id: addOn.id, offer_id: o.id })}>
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

export default function AddOns() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [offersTarget, setOffersTarget] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['add-ons'], queryFn: () => getAddOns() })
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => getCities() })
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const addOns = data?.data ?? []
  const cities = citiesData?.data ?? []
  const categories = catData?.data ?? []

  const createMut = useMutation({
    mutationFn: createAddOn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['add-ons'] }); setSheetOpen(false); toast.success('Add-On created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateAddOn(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['add-ons'] }); setSheetOpen(false); toast.success('Add-On updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteAddOn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['add-ons'] }); setDeleteTarget(null); toast.success('Add-On deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Add-Ons"
        description="Additional offer packs available per city"
        action={<Button onClick={() => { setEditing(null); setSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Add-On</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : addOns.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No add-ons yet.</TableCell></TableRow>
            ) : (
              addOns.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a.city?.name ?? '—'}</TableCell>
                  <TableCell>₹{a.price}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.addOnCategories?.length ? a.addOnCategories.map((ac) => ac.category?.name).join(', ') : '—'}
                  </TableCell>
                  <TableCell>{a.addOnOffers?.length ?? 0}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOffersTarget(a)}><List className="mr-2 h-4 w-4" />Manage Offers</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditing(a); setSheetOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(a)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          <SheetHeader><SheetTitle>{editing ? 'Edit Add-On' : 'Add Add-On'}</SheetTitle></SheetHeader>
          <div className="px-4 pb-2">
            <AddOnForm
              key={editing?.id ?? 'new'}
              defaultValues={editing}
              cities={cities}
              categories={categories}
              onSubmit={handleSubmit}
              loading={createMut.isPending || updateMut.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>
      <OffersDialog addOn={offersTarget} open={!!offersTarget} onOpenChange={(v) => !v && setOffersTarget(null)} />
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Add-On" description={`Delete "${deleteTarget?.title}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
