'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Memo {
  id: string
  title: string
  content: string
}

export default function EditMemoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [memo, setMemo] = useState<Memo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMemo() {
      try {
        const response = await fetch(`/api/memos/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch memo')
        const data = await response.json()
        setMemo(data)
      } catch (error) {
        setError('Failed to load memo')
        console.error(error)
      }
    }

    fetchMemo()
  }, [params.id])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch(`/api/memos/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to update memo')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError('Failed to update memo')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Go back
        </button>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Edit Memo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={memo.title}
            className="w-full px-3 py-2 border rounded-md border-gray-200 dark:border-gray-800 bg-transparent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={memo.content}
            className="w-full px-3 py-2 border rounded-md border-gray-200 dark:border-gray-800 bg-transparent"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
