import { useState, useEffect, useCallback, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

interface Memo {
  id: string
  title: string
  content: string
  updatedAt: Date
}

export function useMemoList(initialMemos: Memo[], searchQuery?: string) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  const loadMore = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      const res = await fetch(`/api/memos?page=${page + 1}&limit=9`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      if (data.memos?.length > 0) {
        setMemos((prev) => [...prev, ...data.memos])
        setPage((p) => p + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [page, loading])

  useEffect(() => {
    if (inView) {
      loadMore()
    }
  }, [inView, loadMore])

  const filteredMemos = useMemo(() => {
    return memos
      .filter((memo) =>
        searchQuery
          ? memo.title.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  }, [memos, searchQuery])

  return {
    memos: filteredMemos,
    loading,
    error,
    loadMoreRef: ref,
    handleDelete: async (id: string) => {
      try {
        const response = await fetch(`/api/memos/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete memo')
        setMemos((prev) => prev.filter((memo) => memo.id !== id))
      } catch (err) {
        setError('Failed to delete memo')
      }
    },
  }
}
