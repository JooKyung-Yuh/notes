'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Memo
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session && (
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
