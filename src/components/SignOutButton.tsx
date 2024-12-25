'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { DeleteConfirmation } from '@/components/ui/modal'
import { guestStorage } from '@/lib/guest-storage'

export function SignOutButton() {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)

  const handleSignOut = () => {
    if (session?.user?.isGuest) {
      setShowModal(true)
      return
    }
    signOut()
  }

  const handleConfirmSignOut = () => {
    guestStorage.clearAll()
    signOut()
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        Sign out
      </button>

      <DeleteConfirmation
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmSignOut}
        title="Sign out from guest mode?"
        message={
          <>
            <p className="mb-4">
              All your memos will be permanently deleted. This action cannot be
              undone.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 To keep your memos, please{' '}
              <a href="/login" className="text-blue-500 hover:underline">
                sign in
              </a>{' '}
              or{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                create an account
              </a>{' '}
              before signing out.
            </p>
          </>
        }
        confirmText="Sign out anyway"
        cancelText="Cancel"
      />
    </>
  )
}