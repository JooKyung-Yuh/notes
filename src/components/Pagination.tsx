'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  total: number
  pages: number
  current: number
}

export default function Pagination({ total, pages, current }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  if (pages <= 1) return null

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
        className="p-2 border rounded-md disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              current === page
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => handlePageChange(current + 1)}
        disabled={current === pages}
        className="p-2 border rounded-md disabled:opacity-50"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
