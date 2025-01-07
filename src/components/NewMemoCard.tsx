'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/toast'
import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'

// 이미지 타입 정의
interface ImageData {
  id: string
  url: string
  file: File
}

export function NewMemoCard() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const { data: session } = useSession()
  const [images, setImages] = useState<ImageData[]>([])

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          if (file) {
            const imageData = {
              id: crypto.randomUUID(),
              url: URL.createObjectURL(file),
              file,
            }
            setImages((prev) => [...prev, imageData])
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    try {
      if (session?.user?.isGuest) {
        const imageUrls = images.map((img) => img.url)
        const newMemo = guestStorage.createMemo(title, content, imageUrls)
        if (newMemo) {
          router.refresh()
          setIsEditing(false)
          showToast('Memo created successfully', 'success')
        }
        return
      }

      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const imgFormData = new FormData()
          imgFormData.append('file', img.file)
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: imgFormData,
          })
          if (!response.ok) throw new Error('Failed to upload image')
          return response.json()
        }),
      )

      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          images: uploadedImages.map((img) => img.url),
        }),
      })

      if (!response.ok) throw new Error('Failed to create memo')

      router.refresh()
      setIsEditing(false)
    } catch (error) {
      showToast('Failed to create memo', 'error')
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

      <div className="flex gap-4 h-[160px]">
        <textarea
          name="content"
          placeholder="Write your memo..."
          required
          className="flex-1 bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none resize-none"
        />

        {/* 이미지 미리보기 섹션 */}
        {images.length > 0 && (
          <div className="w-32 flex-shrink-0 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Pasted image"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) =>
                        prev.filter((img) => img.id !== image.id),
                      )
                    }
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
