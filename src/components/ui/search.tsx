'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set('q', debouncedValue)
    } else {
      params.delete('q')
    }
    router.push(`/dashboard?${params.toString()}`)
  }, [debouncedValue, router, searchParams])

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search memos..."
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
    </div>
  )
}
