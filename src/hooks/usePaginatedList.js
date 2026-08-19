import { useMemo, useState } from 'react'

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

export function usePaginatedList(items, { searchKeys = [], pageSize = 10 } = {}) {
  const [search, setSearchRaw] = useState('')
  const [page, setPage] = useState(1)

  const setSearch = (value) => {
    setSearchRaw(value)
    setPage(1)
  }

  const filtered = useMemo(() => {
    const list = items ?? []
    if (!search.trim() || searchKeys.length === 0) return list
    const needle = search.trim().toLowerCase()
    return list.filter((item) =>
      searchKeys.some((key) => String(getPath(item, key) ?? '').toLowerCase().includes(needle))
    )
  }, [items, search, searchKeys])

  const totalCount = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  )

  return {
    search,
    setSearch,
    page: safePage,
    setPage,
    pageItems,
    totalPages,
    totalCount,
  }
}
