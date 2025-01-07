'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { guestStorage } from '@/lib/guest-storage'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guestMemoCount = session?.user?.isGuest
    ? guestStorage.getMemos().length
    : 0

  if (status === 'loading') {
    return null
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email')

      const result = await signIn('credentials', {
        email: email,
        password: formData.get('password'),
        guestMemos: session?.user?.isGuest
          ? JSON.stringify(guestStorage.getMemos())
          : '[]',
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      const adminCheck = await fetch('/api/admin/check')
      const { isAdmin } = await adminCheck.json()

      if (session?.user?.isGuest) {
        const guestMemoData = guestStorage.getMemos()
        await fetch('/api/auth/transfer-memos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memos: guestMemoData }),
        })
        guestStorage.clearAll()
      }

      // 세션 업데이트를 기다리지 않고 바로 리다이렉트
      if (isAdmin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during sign in')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {session?.user?.isGuest ? (
        <>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            {guestMemoCount > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  You have {guestMemoCount} memo{guestMemoCount > 1 ? 's' : ''}{' '}
                  in guest mode. Your memos will be safely transferred when you
                  log in!
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your email to sign in to your account
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg border-gray-200 dark:border-gray-700 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg border-gray-200 dark:border-gray-700 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {!session?.user?.isGuest && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-background">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const result = await signIn('guest', { redirect: false })
                if (!result?.error) {
                  window.location.href = '/dashboard'
                }
              }}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              Continue as Guest
            </button>
          </>
        )}
      </form>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </Link>
      </p>
      <div className="text-sm text-center space-y-2">
        <p className="text-gray-500 dark:text-gray-400">
          Forgot your password?
        </p>
        <a
          href="https://open.kakao.com/o/srvP966g"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Please contact the administrator to reset your password
        </a>
      </div>
    </div>
  )
}
