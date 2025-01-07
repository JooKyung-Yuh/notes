'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/toast'
import { DeleteConfirmation } from '@/components/ui/modal'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { HighlightText } from '@/components/ui/highlight-text'
import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'
import { ImageModal } from '@/components/ui/image-modal'

interface MemoCardProps {
  id: string
  title: string
  content: string
  images?: string[]
  updatedAt: Date | string
  searchQuery?: string
  onDelete?: (id: string) => Promise<void>
}

export function MemoCard({
  id,
  title: initialTitle,
  content: initialContent,
  images: initialImages = [],
  updatedAt,
  searchQuery,
  onDelete,
}: MemoCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { handleError } = useErrorHandler()
  const { data: session } = useSession()
  const [images, setImages] = useState<string[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  async function handleUpdate() {
    setLoading(true)
    try {
      if (session?.user?.isGuest) {
        const updatedMemo = guestStorage.updateMemo(id, title, content)
        if (updatedMemo) {
          setIsEditing(false)
          router.refresh()
          showToast('Memo updated successfully', 'success')
        }
        return
      }

      const response = await fetch(`/api/memos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw response

      setIsEditing(false)
      router.refresh()
      showToast('Memo updated successfully', 'success')
    } catch (error) {
      handleError(error, 'Failed to update memo')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      if (session?.user?.isGuest) {
        const deleted = guestStorage.deleteMemo(id)
        if (deleted) {
          router.refresh()
          showToast('Memo deleted successfully', 'success')
        }
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

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
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
          className="w-full h-[120px] mt-4 resize-none bg-transparent focus:outline-none"
        />

        {/* 이미지 관리 섹션 */}
        <div className="mt-4">
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <button
            aria-label="save changes"
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
    <>
      <div className="h-[300px] relative p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all group">
        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            aria-label="edit"
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            aria-label="delete"
            onClick={handleDeleteClick}
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2 h-full flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            <HighlightText text={title} highlight={searchQuery} />
          </h3>

          {/* 이미지가 있는 경우 이미지 미리보기 표시 */}
          {images && images.length > 0 && (
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={images[0]}
                alt={`Image for ${title}`}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(images[0])}
              />
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  +{images.length - 1}
                </div>
              )}
            </div>
          )}

          {/* 컨텐츠 영역 - 이미지가 있으면 높이 조절 */}
          <div
            className={`flex-1 overflow-hidden ${
              images?.length ? 'max-h-24' : 'max-h-48'
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
              <HighlightText text={content} highlight={searchQuery} />
            </p>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(updatedAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Memo"
        message="Are you sure you want to delete this memo?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        images={images}
        currentImageIndex={selectedImage ? images.indexOf(selectedImage) : 0}
        alt={`Image for ${title}`}
      />
    </>
  )
}
