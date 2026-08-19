import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const withGaps = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push('...')
    withGaps.push(p)
  })
  return withGaps
}

export default function DataPagination({ page, totalPages, totalCount, pageSize = 10, onPageChange }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount ?? page * pageSize)

  return (
    <div className="flex items-center justify-between mt-4">
      {totalCount != null && (
        <p className="text-sm text-muted-foreground">
          Showing {from}–{to} of {totalCount}
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
