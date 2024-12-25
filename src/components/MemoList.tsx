'use client'

import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { MemoCard } from './MemoCard'

interface Memo {
  id: string
  title: string
  content: string
  updatedAt: Date
}

interface MemoListProps {
  initialMemos: Memo[]
  searchQuery?: string
}

export function MemoList({ initialMemos, searchQuery }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>(
    searchQuery
      ? initialMemos.filter(
          (memo) =>
            memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memo.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : initialMemos,
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const page = useRef(1)
  const { ref, inView } = useInView()
  const { data: session } = useSession()
  const router = useRouter()

  async function loadMoreMemos() {
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
  }

  useEffect(() => {
    if (inView) {
      loadMoreMemos()
    }
  }, [inView])

  useEffect(() => {
    if (session?.user?.isGuest) {
      const guestMemos = guestStorage.getMemos()
      setMemos(guestMemos)
    } else {
      setMemos(
        searchQuery
          ? initialMemos.filter(
              (memo) =>
                memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                memo.content.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : initialMemos,
      )
    }
    page.current = 1
    setHasMore(true)
  }, [searchQuery, initialMemos, session?.user?.isGuest])

  async function handleDelete(id: string) {
    try {
      if (session?.user?.isGuest) {
        guestStorage.deleteMemo(id)
        router.refresh()
        return
      }

      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete memo')

      router.refresh()
    } catch (error) {
      console.error(error)
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
