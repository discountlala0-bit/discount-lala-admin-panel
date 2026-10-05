import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getBooklets, getBookletById, createBooklet, updateBooklet, deleteBooklet } from '@/api/booklets'
import { getCities } from '@/api/cities'
import { getCategories } from '@/api/categories'
import { getOffers, addOfferToBooklet, removeOfferFromBooklet, setBookletOfferVisibility, updateOffer } from '@/api/offers'
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
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2, List, X } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ImageUpload from '@/components/shared/ImageUpload'
import SearchInput from '@/components/shared/SearchInput'
import DataPagination from '@/components/shared/DataPagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'

const schema = z.object({
  city_id: z.string().min(1, 'City is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  validity: z.coerce.number().int().min(1).optional(),
  popularity: z.coerce.number().int().min(0).optional(),
  image: z.string().optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
})

function BookletForm({ defaultValues, cities, categories, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
      image: '',
      categories: [],
      validity: 365,
      popularity: 0,
      ...defaultValues,
      city_id: defaultValues?.cityId ?? defaultValues?.city_id ?? '',
      categories: defaultValues?.bookletCategories?.map((bc) => String(bc.categoryId ?? bc.category?.id)) ?? [],
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
        <Input {...register('title')} placeholder="Mumbai Booklet 2025" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input {...register('price')} type="number" placeholder="499" />
        </div>
        <div className="space-y-2">
          <Label>Validity (days)</Label>
          <Input {...register('validity')} type="number" placeholder="365" />
        </div>
        <div className="space-y-2">
          <Label>Popularity</Label>
          <Input {...register('popularity')} type="number" placeholder="0" min="0" />
          <p className="text-[10px] text-muted-foreground">Lower number = top</p>
        </div>
      </div>
      <ImageUpload label="Booklet Cover Image" value={image} onChange={(url) => setValue('image', url)} />
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

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 40, 50]

function OffersDialog({ booklet, open, onOpenChange }) {
  const qc = useQueryClient()
  const [selectedOffer, setSelectedOffer] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('1')
  const [removeTarget, setRemoveTarget] = useState(null)

  const { data: bookletData, isLoading } = useQuery({
    queryKey: ['booklet', booklet?.id],
    queryFn: () => getBookletById(booklet.id),
    enabled: !!booklet,
  })
  const cityId = booklet?.cityId ?? booklet?.city_id ?? booklet?.city?.id
  const { data: allOffersData } = useQuery({
    queryKey: ['offers', { city_id: cityId }],
    queryFn: () => getOffers({ city_id: cityId }),
    enabled: !!booklet,
  })

  const linkedBookletOffers = bookletData?.data?.bookletOffers ?? []
  const allOffers = allOffersData?.data ?? []
  const linkedIds = new Set(linkedBookletOffers.map((bo) => String(bo.offer.id)))
  const unlinked = allOffers.filter((o) =>
    o.offerType === 'booklet' &&
    !linkedIds.has(String(o.id)) &&
    (!o.bookletOffers || o.bookletOffers.length === 0)
  )

  const addMut = useMutation({
    mutationFn: ({ booklet_id, offer_id, quantity }) => addOfferToBooklet(booklet_id, offer_id, quantity),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklet', booklet.id] }); setSelectedOffer(''); setSelectedQuantity('1'); toast.success('Offer added') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const removeMut = useMutation({
    mutationFn: ({ booklet_id, offer_id }) => removeOfferFromBooklet(booklet_id, offer_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booklet', booklet.id] }); setRemoveTarget(null); toast.success('Offer removed') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const visibilityMut = useMutation({
    mutationFn: ({ booklet_id, offer_id, hidden_for_new_users }) => setBookletOfferVisibility(booklet_id, offer_id, hidden_for_new_users),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['booklet', booklet.id] })
      toast.success(vars.hidden_for_new_users ? 'Hidden from new users' : 'Visible to new users again')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const updateOfferMut = useMutation({
    mutationFn: ({ id, data }) => updateOffer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booklet', booklet.id] })
      qc.invalidateQueries({ queryKey: ['offers'] })
      toast.success('Offer popularity updated')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
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
          <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {QUANTITY_OPTIONS.map((q) => (
                <SelectItem key={q} value={String(q)}>{q}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedOffer || addMut.isPending}
            onClick={() => addMut.mutate({ booklet_id: booklet.id, offer_id: selectedOffer, quantity: Number(selectedQuantity) })}
          >
            {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Selecting (e.g. 20x) links the same coupon into this booklet with 20 separate redemptions for the customer.
          Set Popularity (lower number = top). Use "New Users" switch to hide a coupon from future buyers.
        </p>
        <div className="mt-2 rounded-md border max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>New Users</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>)
              ) : linkedBookletOffers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No offers linked</TableCell></TableRow>
              ) : (
                linkedBookletOffers.map((bo) => (
                  <TableRow key={bo.offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bo.offer.title}
                        {bo.hiddenForNewUsers && <Badge variant="secondary">Hidden</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>₹{bo.offer.price}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20 h-8 text-xs"
                        min="0"
                        defaultValue={bo.offer?.popularity ?? 0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = parseInt(e.currentTarget.value, 10) || 0
                            if (val !== (bo.offer?.popularity ?? 0)) {
                              updateOfferMut.mutate({ id: bo.offer.id, data: { popularity: val } })
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10) || 0
                          if (val !== (bo.offer?.popularity ?? 0)) {
                            updateOfferMut.mutate({ id: bo.offer.id, data: { popularity: val } })
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={String(bo.quantity ?? 1)}
                        onValueChange={(v) => addMut.mutate({ booklet_id: booklet.id, offer_id: bo.offer.id, quantity: Number(v) })}
                      >
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {QUANTITY_OPTIONS.map((q) => (
                            <SelectItem key={q} value={String(q)}>{q}x</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Switch
                              checked={!bo.hiddenForNewUsers}
                              onCheckedChange={(checked) => visibilityMut.mutate({ booklet_id: booklet.id, offer_id: bo.offer.id, hidden_for_new_users: !checked })}
                              disabled={visibilityMut.isPending}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {bo.hiddenForNewUsers
                            ? 'Hidden from new buyers — existing owners still keep it. Toggle to show again.'
                            : 'Visible to new buyers. Toggle off to hide from future buyers only (existing owners keep it).'}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setRemoveTarget(bo)}>
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
    <ConfirmDialog
      open={!!removeTarget}
      onOpenChange={(v) => !v && setRemoveTarget(null)}
      title="Remove Coupon from Booklet"
      description={`Permanently unlink "${removeTarget?.offer?.title}" from this booklet? Customers who already purchased this booklet will keep this coupon — only future buyers won't receive it. The coupon itself won't be deleted, but it will disappear from this list (use the "New Users" switch instead if you may want to re-enable it later).`}
      onConfirm={() => removeMut.mutate({ booklet_id: booklet.id, offer_id: removeTarget.offer.id })}
      loading={removeMut.isPending}
    />
    </>
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
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const booklets = data?.data ?? []
  const cities = citiesData?.data ?? []
  const categories = catData?.data ?? []
  const paginated = usePaginatedList(booklets, { searchKeys: ['title', 'city.name'] })

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
      <div className="mb-4">
        <SearchInput value={paginated.search} onChange={paginated.setSearch} placeholder="Search booklets..." />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Popularity</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : booklets.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No booklets yet.</TableCell></TableRow>
            ) : paginated.pageItems.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No results match your search.</TableCell></TableRow>
            ) : (
              paginated.pageItems.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {b.image && <img src={b.image} alt={b.title} className="h-8 w-8 rounded object-cover shrink-0" />}
                      {b.title}
                    </div>
                  </TableCell>
                  <TableCell>{b.city?.name ?? '—'}</TableCell>
                  <TableCell>₹{b.price}</TableCell>
                  <TableCell>{b.validity ? `${b.validity}d` : '—'}</TableCell>
                  <TableCell>{b.popularity ?? 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.bookletCategories?.length ? b.bookletCategories.map((bc) => bc.category?.name).join(', ') : '—'}
                  </TableCell>
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
      <DataPagination
        page={paginated.page}
        totalPages={paginated.totalPages}
        totalCount={paginated.totalCount}
        onPageChange={paginated.setPage}
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Edit Booklet' : 'Add Booklet'}</SheetTitle></SheetHeader>
          <div className="px-4 pb-2">
            <BookletForm
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
      <OffersDialog booklet={offersTarget} open={!!offersTarget} onOpenChange={(v) => !v && setOffersTarget(null)} />
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Booklet" description={`Delete "${deleteTarget?.title}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)} loading={deleteMut.isPending}
      />
    </div>
  )
}
