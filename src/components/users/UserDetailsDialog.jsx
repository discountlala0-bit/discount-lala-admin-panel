import { useQuery } from '@tanstack/react-query'
import { getUserDetails } from '@/api/users'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  User,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Ticket,
  CheckCircle2,
  BookOpen,
  DollarSign,
  AlertCircle,
} from 'lucide-react'

export default function UserDetailsDialog({ userId, open, onOpenChange }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: () => getUserDetails(userId),
    enabled: !!userId && open,
  })

  const details = data?.data
  const user = details?.user
  const stats = details?.stats
  const orders = details?.orders ?? []
  const bookletCoupons = details?.bookletCoupons ?? []
  const addOnCoupons = details?.addOnCoupons ?? []
  const redeemedCoupons = details?.redeemedCoupons ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:w-[85vw] md:w-[75vw] lg:w-[70vw] sm:max-w-[70vw] max-w-[70vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{user?.name ?? 'User Details'}</span>
                {user && (
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </Badge>
                )}
                {user?.hasBooklet && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                    Has Booklet
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                ID: {userId}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Failed to load customer details ({error.message})</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Contact Info Header Bar */}
            <div className="flex flex-wrap gap-4 text-xs bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{user?.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{user?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              </div>
              {user?.deactivatedAt && (
                <div className="flex items-center gap-1.5 text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Deactivated: {new Date(user.deactivatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="border rounded-lg p-3 bg-card shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>Total Orders</span>
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold">{stats?.totalOrders ?? 0}</div>
              </div>
              <div className="border rounded-lg p-3 bg-card shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>Total Spent</span>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-xl font-bold">₹{(stats?.totalSpent ?? 0).toFixed(0)}</div>
              </div>
              <div className="border rounded-lg p-3 bg-card shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>Booklet Coupons</span>
                  <BookOpen className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-xl font-bold">{stats?.totalBookletCoupons ?? 0}</div>
              </div>
              <div className="border rounded-lg p-3 bg-card shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>Add-on Coupons</span>
                  <Ticket className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold">{stats?.totalAddOnCoupons ?? 0}</div>
              </div>
              <div className="border rounded-lg p-3 bg-card shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>Redeemed</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-600">{stats?.totalRedeemedCoupons ?? 0}</div>
              </div>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-4">
                <TabsTrigger value="orders" className="py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="booklets" className="py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Booklet Coupons ({bookletCoupons.length})
                </TabsTrigger>
                <TabsTrigger value="addons" className="py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Add-on Coupons ({addOnCoupons.length})
                </TabsTrigger>
                <TabsTrigger value="redeemed" className="py-2.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Redeemed Logs ({redeemedCoupons.length})
                </TabsTrigger>
              </TabsList>

              {/* ORDERS TAB */}
              <TabsContent value="orders" className="pt-4">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No orders placed by this customer yet.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((o) => {
                          const payment = o.payments?.[0]
                          return (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono text-xs font-medium">#{o.id.substring(0, 8)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(o.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs">
                                {o.items?.map((it, idx) => (
                                  <div key={idx} className="font-medium">
                                    <span className="capitalize text-muted-foreground mr-1">[{it.itemType}]</span>
                                    {it.itemDetails?.title || 'Item #' + it.itemId.substring(0, 6)}
                                    {it.price ? ` (₹${it.price})` : ''}
                                  </div>
                                ))}
                              </TableCell>
                              <TableCell className="font-bold">₹{o.totalAmount}</TableCell>
                              <TableCell>
                                <Badge variant={payment?.paymentStatus === 'success' ? 'success' : 'outline'}>
                                  {payment?.paymentStatus || 'pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={o.status === 'completed' ? 'success' : 'secondary'} className="capitalize">
                                  {o.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* BOOKLET COUPONS TAB */}
              <TabsContent value="booklets" className="pt-4">
                {bookletCoupons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No booklet coupons found for this customer.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Offer Title</TableHead>
                          <TableHead>Outlet</TableHead>
                          <TableHead>Redeem Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookletCoupons.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium text-xs">{c.offer?.title || 'Booklet Offer'}</TableCell>
                            <TableCell className="text-xs">{c.offer?.place?.name || 'Outlet'}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-primary">
                              {c.redeemCode || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={c.status === 'redeemed' ? 'destructive' : c.status === 'active' ? 'success' : 'secondary'}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* ADD-ON COUPONS TAB */}
              <TabsContent value="addons" className="pt-4">
                {addOnCoupons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No add-on coupons purchased by this customer.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Offer Title</TableHead>
                          <TableHead>Outlet</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Redeem Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Purchased Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addOnCoupons.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium text-xs">{c.offer?.title || 'Add-on Offer'}</TableCell>
                            <TableCell className="text-xs">{c.offer?.place?.name || 'Outlet'}</TableCell>
                            <TableCell className="font-bold text-xs">₹{c.offer?.price ?? '—'}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-primary">
                              {c.redeemCode || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={c.status === 'redeemed' ? 'destructive' : c.status === 'active' ? 'success' : 'secondary'}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* REDEEMED LOGS TAB */}
              <TabsContent value="redeemed" className="pt-4">
                {redeemedCoupons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No coupons redeemed by this customer yet.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Redeem Code</TableHead>
                          <TableHead>Offer Title</TableHead>
                          <TableHead>Outlet Name</TableHead>
                          <TableHead>Origin</TableHead>
                          <TableHead>Redeemed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redeemedCoupons.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs font-bold text-emerald-600">
                              {c.redeemCode || '—'}
                            </TableCell>
                            <TableCell className="font-medium text-xs">{c.offer?.title || 'Coupon'}</TableCell>
                            <TableCell className="text-xs">{c.offer?.place?.name || 'Outlet'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {c.isBookletOrigin ? 'Booklet' : 'Add-on'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {c.redeemedAt ? new Date(c.redeemedAt).toLocaleString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
