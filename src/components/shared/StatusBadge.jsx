import { Badge } from '@/components/ui/badge'

const variants = {
  active: 'default',
  inactive: 'secondary',
  pending: 'outline',
  paid: 'default',
  confirmed: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  failed: 'destructive',
  redeemed: 'secondary',
  rewarded: 'default',
  not_rewarded: 'outline',
}

export default function StatusBadge({ status }) {
  return (
    <Badge variant={variants[status] ?? 'outline'} className="capitalize">
      {status?.replace(/_/g, ' ')}
    </Badge>
  )
}
