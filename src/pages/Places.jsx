import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getPlaces, createPlace, updatePlace, deletePlace } from '@/api/places'
import { getCategories } from '@/api/categories'
import { getCities } from '@/api/cities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import SearchInput from '@/components/shared/SearchInput'
import DataPagination from '@/components/shared/DataPagination'
import ImageUpload from '@/components/shared/ImageUpload'
import { usePaginatedList } from '@/hooks/usePaginatedList'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category_id: z.string().min(1, 'Category is required'),
  city_ids: z.array(z.string()).optional(),
  city_id: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

function PlaceForm({ defaultValues, categories, cities, onSubmit, loading }) {
  const initialCityIds = (() => {
    if (defaultValues?.city_ids && Array.isArray(defaultValues.city_ids)) {
      return defaultValues.city_ids.map(String)
    }
    if (defaultValues?.cities && Array.isArray(defaultValues.cities)) {
      return defaultValues.cities.map((c) => String(c.id ?? c))
    }
    const single = defaultValues?.cityId ?? defaultValues?.city_id
    return single ? [String(single)] : []
  })()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
      ...defaultValues,
      category_id: defaultValues?.categoryId ?? defaultValues?.category_id ?? '',
      city_ids: initialCityIds,
      city_id: initialCityIds[0] ?? '',
      image: defaultValues?.image ?? '',
    },
  })
  const status = watch('status')
  const category_id = watch('category_id')
  const city_ids = watch('city_ids') ?? []
  const image = watch('image')

  const toggleCity = (cityId) => {
    const strId = String(cityId)
    const next = city_ids.includes(strId)
      ? city_ids.filter((id) => id !== strId)
      : [...city_ids, strId]
    setValue('city_ids', next)
    setValue('city_id', next[0] ?? '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ImageUpload label="Place Image" value={image} onChange={(url) => setValue('image', url)} />
      <div className="space-y-2">
        <Label>Place Name</Label>
        <Input {...register('name')} placeholder="McDonald's" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Cities (Select one or more)</Label>
          {city_ids.length > 0 && (
            <span className="text-xs text-muted-foreground">{city_ids.length} selected</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 rounded-md border p-2 min-h-11 max-h-48 overflow-y-auto">
          {cities.map((c) => {
            const selected = city_ids.includes(String(c.id))
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCity(c.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1 ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary font-medium'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                <span>{selected ? '✓' : '+'}</span>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          You can link this place to multiple cities without removing it from other cities.
        </p>
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
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => getCities() })
  const places = data?.data ?? []
  const categories = catData?.data ?? []
  const cities = citiesData?.data ?? []
  const paginated = usePaginatedList(places, { searchKeys: ['name', 'address', 'city.name', 'category.name'] })

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
      <div className="mb-4">
        <SearchInput
          value={paginated.search}
          onChange={paginated.setSearch}
          placeholder="Search places..."
          className="max-w-xs"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cities</TableHead>
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
                <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>
              ))
            ) : places.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No places yet.</TableCell></TableRow>
            ) : paginated.pageItems.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No results match your search.</TableCell></TableRow>
            ) : (
              paginated.pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-8 w-8 rounded-full object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted border" />
                      )}
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.cities && p.cities.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {p.cities.map((c) => (
                          <Badge key={c.id ?? c.name} variant="secondary" className="text-xs font-normal">
                            {c.name ?? c}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      p.city?.name ?? '—'
                    )}
                  </TableCell>
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
      <DataPagination
        page={paginated.page}
        totalPages={paginated.totalPages}
        totalCount={paginated.totalCount}
        onPageChange={paginated.setPage}
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Edit Place' : 'Add Place'}</SheetTitle></SheetHeader>
          <div className="px-4 pb-2">
            <PlaceForm
              key={editing?.id ?? 'new'}
              defaultValues={editing}
              categories={categories}
              cities={cities}
              onSubmit={handleSubmit}
              loading={createMut.isPending || updateMut.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Place"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All associated offers will also be deleted.`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
      />
    </div>
  )
}
