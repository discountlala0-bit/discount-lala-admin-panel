import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MapPin, Tag, Store, Gift, BookOpen,
  PlusSquare, Image, ShoppingBag, Users, Truck,
  DollarSign, Ticket, Share2, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/cities', icon: MapPin, label: 'Cities' },
      { to: '/categories', icon: Tag, label: 'Categories' },
      { to: '/places', icon: Store, label: 'Places' },
      { to: '/offers', icon: Gift, label: 'Offers' },
      { to: '/booklets', icon: BookOpen, label: 'Booklets' },
      { to: '/add-ons', icon: PlusSquare, label: 'Add-Ons' },
      { to: '/banners', icon: Image, label: 'Banners' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/orders', icon: ShoppingBag, label: 'Orders' },
      { to: '/coupons', icon: Ticket, label: 'Coupons' },
      { to: '/referrals', icon: Share2, label: 'Referrals' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/users', icon: Users, label: 'Users' },
      { to: '/distributors', icon: Truck, label: 'Distributors' },
      { to: '/commissions', icon: DollarSign, label: 'Commissions' },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Discount Lala</span>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
            {!collapsed && <Separator className="mt-2 mx-4" />}
          </div>
        ))}
      </ScrollArea>
    </aside>
  )
}
