'use client'

import { useToast } from '@/components/ui/toast'
import { useCallback } from 'react'

interface ErrorResponse {
  error?: string
  message?: string
}

export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = useCallback(
    async (error: unknown, fallbackMessage = 'Something went wrong') => {
      console.error(error)

      if (error instanceof Response) {
        try {
          const data: ErrorResponse = await error.json()
          showToast(data.error || data.message || fallbackMessage, 'error')
          return
        } catch {
          showToast(fallbackMessage, 'error')
          return
        }
      }

      if (error instanceof Error) {
        showToast(error.message || fallbackMessage, 'error')
        return
      }

      showToast(fallbackMessage, 'error')
    },
    [showToast],
  )

  return { handleError }
}
