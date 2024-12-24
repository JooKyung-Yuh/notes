'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAdminUser(data.isAdmin)
    }
    if (session?.user?.email) {
      checkAdmin()
    }
  }, [session])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            Memo Service
          </Link>
          <nav className="flex items-center gap-4">
            {isAdminUser && (
              <Link
                href="/admin"
                className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
