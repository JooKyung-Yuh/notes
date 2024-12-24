'use client'

import { useEffect, useRef, useState } from 'react'
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
}

export function MemoList({ initialMemos }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const page = useRef(1)
  const { ref, inView } = useInView()

  async function loadMoreMemos() {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/memos?page=${page.current + 1}&limit=9`,
      )
      const data = await response.json()

      if (data.memos.length === 0) {
        setHasMore(false)
        return
      }

      setMemos((prev) => [...prev, ...data.memos])
      page.current += 1
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

  return (
    <>
      {memos.map((memo) => (
        <MemoCard
          key={memo.id}
          id={memo.id}
          title={memo.title}
          content={memo.content}
          updatedAt={memo.updatedAt}
        />
      ))}
      {hasMore && (
        <div ref={ref} className="col-span-full flex justify-center p-4">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          ) : (
            <div className="h-8" /> // Spacer for intersection observer
          )}
        </div>
      )}
    </>
  )
}
