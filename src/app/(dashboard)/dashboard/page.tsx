import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NewMemoCard } from '@/components/NewMemoCard'
import { MemoList } from '@/components/MemoList'
import { Search } from '@/components/ui/search'
import { guestStorage } from '@/lib/guest-storage'
import Link from 'next/link'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  isGuest?: boolean
}

interface Session {
  user: User | null
}

async function getInitialMemos(userId: string, query?: string) {
  const limit = 9
  const memos = await prisma.memo.findMany({
    where: {
      userId,
      OR: query
        ? [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })
  return memos
}

interface SearchParams {
  q?: string
}

interface PageProps {
  searchParams: SearchParams
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = (await getServerSession(authOptions)) as Session | null

  let memos = session?.user?.isGuest
    ? guestStorage.getMemos().map((memo) => ({
        ...memo,
        updatedAt: new Date(memo.updatedAt),
      }))
    : session?.user?.id
    ? await getInitialMemos(session.user.id, searchParams.q)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {session?.user?.isGuest ? 'Guest Memos' : 'My Memos'}
        </h1>
        {session?.user?.isGuest && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-yellow-600 dark:text-yellow-500">
              ⚠️ Guest mode - Data will be lost after closing browser
            </div>
            <div className="text-sm flex gap-2">
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up to keep your memos permanently
              </Link>
              <span className="text-gray-500">or</span>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Log in to transfer your memos
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your guest memos will be automatically transferred to your
              account!
            </p>
          </div>
        )}
        <div className="w-72">
          <Search />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NewMemoCard />
        <MemoList initialMemos={memos} searchQuery={searchParams.q} />
      </div>
    </div>
  )
}
