'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/toast'
import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'

export function NewMemoCard() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    try {
      if (session?.user?.isGuest) {
        guestStorage.createMemo(title, content)
        console.log('Guest memo created:', { title, content })
        console.log('All guest memos:', guestStorage.getMemos())
        router.refresh()
        setIsEditing(false)
        return
      }

      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) throw new Error('Failed to create memo')

      router.refresh()
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create memo',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="h-[300px] w-full p-6 bg-white dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <PlusIcon className="w-5 h-5" />
        New Memo
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[300px] relative p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4"
    >
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
      <input
        name="title"
        type="text"
        placeholder="Title"
        required
        className="w-full bg-transparent border-none p-0 text-lg font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none"
      />
      <textarea
        name="content"
        placeholder="Write your memo..."
        required
        className="w-full h-[160px] bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none resize-none"
      />
      <div className="absolute bottom-6 right-6">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  )
}
