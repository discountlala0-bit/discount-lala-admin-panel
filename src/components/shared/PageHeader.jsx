import { isValidElement } from 'react'
import { Button } from '@/components/ui/button'

export default function PageHeader({ title, description, action }) {
  const renderAction = () => {
    if (!action) return null
    if (isValidElement(action)) return action
    if (typeof action === 'object' && action.label) {
      const Icon = action.icon
      return (
        <Button onClick={action.onClick}>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )
    }
    return null
  }

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div>{renderAction()}</div>}
    </div>
  )
}
