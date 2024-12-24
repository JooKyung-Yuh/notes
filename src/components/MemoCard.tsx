'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface MemoCardProps {
  id: string
  title: string
  content: string
  updatedAt: Date
}

export function MemoCard({
  id,
  title: initialTitle,
  content: initialContent,
  updatedAt,
}: MemoCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  async function handleUpdate() {
    setLoading(true)
    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsEditing(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update memo:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this memo?')) return

    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete memo:', error)
    }
  }

  if (isEditing) {
    return (
      <div className="h-[300px] relative p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm transition-all">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 border-b border-gray-200 dark:border-gray-800 bg-transparent focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[180px] mt-4 resize-none bg-transparent focus:outline-none"
        />
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <CheckIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] relative p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all group">
      <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-6">
          {content}
        </p>
      </div>
      <div className="absolute bottom-6 left-6 text-xs text-gray-500 dark:text-gray-400">
        {new Date(updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
