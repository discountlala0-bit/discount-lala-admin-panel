import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getAllCoupons, createCoupon } from '@/api/coupons'
import { getOffers } from '@/api/offers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Loader2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'

const schema = z.object({
  offer_id: z.string().min(1, 'Offer is required'),
  user_id: z.string().min(1, 'User ID is required'),
  expires_at: z.string().min(1, 'Expiry date is required'),
})

function CouponForm({ offers, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  const offer_id = watch('offer_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Offer</Label>
        <Select value={offer_id} onValueChange={(v) => setValue('offer_id', v)}>
          <SelectTrigger><SelectValue placeholder="Select offer" /></SelectTrigger>
          <SelectContent>
            {offers.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.offer_id && <p className="text-xs text-destructive">{errors.offer_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>User ID</Label>
        <Input {...register('user_id')} placeholder="User ID" />
        {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Expires At</Label>
        <Input {...register('expires_at')} type="datetime-local" />
        {errors.expires_at && <p className="text-xs text-destructive">{errors.expires_at.message}</p>}
      </div>
      <SheetFooter>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Coupon
        </Button>
      </SheetFooter>
    </form>
  )
}

export default function Coupons() {
  const qc = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: () => getAllCoupons() })
  const { data: offersData } = useQuery({ queryKey: ['offers'], queryFn: () => getOffers() })
  const coupons = data?.data ?? []
  const offers = offersData?.data ?? []

  const createMut = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setSheetOpen(false); toast.success('Coupon created') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="User-specific coupons for individual offers"
        action={<Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Coupon</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Redeem Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Redeemed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
            ) : coupons.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No coupons yet.</TableCell></TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.offer?.title ?? '—'}</TableCell>
                  <TableCell className="text-sm">{c.user?.name ?? c.user?.phoneNumber ?? '—'}</TableCell>
                  <TableCell className="font-mono text-sm">{c.redeemCode}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.redeemedAt ? new Date(c.redeemedAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Create Coupon</SheetTitle></SheetHeader>
          <div className="mt-6">
            <CouponForm offers={offers} onSubmit={(v) => createMut.mutate(v)} loading={createMut.isPending} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
