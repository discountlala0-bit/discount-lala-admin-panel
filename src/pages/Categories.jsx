import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({ name: z.string().min(1, 'Category name is required') })

function CategoryForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register('name')} placeholder="Restaurants" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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

export default function Categories() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })
  const categories = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setSheetOpen(false); toast.success('Category created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create category'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setSheetOpen(false); toast.success('Category updated') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update category'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); toast.success('Category deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete category'),
  })

  const handleSubmit = (values) => {
    if (editing) updateMut.mutate({ id: editing.id, data: values })
    else createMut.mutate(values)
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Categories used to classify places and booklets"
        action={
          <Button onClick={() => { setEditing(null); setSheetOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />Add Category
          </Button>
        }
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(cat); setSheetOpen(true) }}>
                          <Pencil className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(cat)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
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
            <SheetTitle>{editing ? 'Edit Category' : 'Add Category'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CategoryForm
              key={editing?.id ?? 'new'}
              defaultValues={editing}
              onSubmit={handleSubmit}
              loading={createMut.isPending || updateMut.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"?`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
      />
    </div>
  )
}
