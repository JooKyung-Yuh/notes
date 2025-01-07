'use client'

import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { MemoCard } from './MemoCard'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { useToast } from '@/components/ui/toast'
import { sortMemosByDate, searchMemos } from '@/utils/memo'

interface Memo {
  id: string
  title: string
  content: string
  images?: string[]
  updatedAt: Date | string
}

interface MemoListProps {
  initialMemos: Memo[]
  searchQuery?: string
}

export function MemoList({ initialMemos, searchQuery }: MemoListProps) {
  const { handleError } = useErrorHandler()
  const { showToast } = useToast()
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const page = useRef(1)
  const { ref, inView } = useInView()
  const { data: session } = useSession()
  const router = useRouter()

  const loadMoreMemos = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      if (session?.user?.isGuest) {
        setHasMore(false)
        return
      }

      const lastMemo = memos[memos.length - 1]
      const params = new URLSearchParams()
      if (lastMemo) {
        params.set('cursor', lastMemo.id)
      }
      if (searchQuery) {
        params.set('q', searchQuery)
      }

      const response = await fetch(`/api/memos?${params.toString()}`)
      const data = await response.json()

      if (!data.memos?.length || data.memos.length === 0) {
        setHasMore(false)
        return
      }

      setMemos((prev) => [...prev, ...data.memos])
      setHasMore(!!data.nextCursor)
    } catch (error) {
      console.error('Failed to load more memos:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, session?.user?.isGuest, memos, searchQuery])

  useEffect(() => {
    if (inView) {
      loadMoreMemos()
    }
  }, [inView, loadMoreMemos])

  useEffect(() => {
    if (session?.user?.isGuest) {
      const guestMemos = guestStorage.getMemos()
      setMemos(sortMemosByDate(guestMemos))
    } else {
      const sortedMemos = sortMemosByDate(initialMemos)
      setMemos(
        searchQuery ? searchMemos(sortedMemos, searchQuery) : sortedMemos,
      )
    }
    page.current = 1
    setHasMore(true)
  }, [searchQuery, initialMemos, session?.user?.isGuest])

  const handleDelete = async (id: string) => {
    try {
      if (session?.user?.isGuest) {
        guestStorage.deleteMemo(id)
        router.refresh()
        return
      }

      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw response

      router.refresh()
      showToast('Memo deleted successfully', 'success')
    } catch (error) {
      handleError(error, 'Failed to delete memo')
    }
  }

  if (memos.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery
            ? `No memos found for "${searchQuery}"`
            : 'No memos yet. Create your first memo!'}
        </p>
      </div>
    )
  }

  return (
    <>
      {memos.map((memo) => (
        <MemoCard
          key={memo.id}
          id={memo.id}
          title={memo.title}
          content={memo.content}
          images={memo.images}
          updatedAt={memo.updatedAt}
          searchQuery={searchQuery}
          onDelete={handleDelete}
        />
      ))}
      {hasMore && (
        <div ref={ref} className="col-span-full flex justify-center p-4">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
    </>
  )
}
