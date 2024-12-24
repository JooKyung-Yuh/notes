import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getMemos(userId: string) {
  return await prisma.memo.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const memos = session?.user?.id ? await getMemos(session.user.id) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Memos</h1>
        <Link
          href="/dashboard/memos/new"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          New Memo
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memos.map((memo) => (
          <Link
            key={memo.id}
            href={`/dashboard/memos/${memo.id}`}
            className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <h2 className="font-semibold mb-2">{memo.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {memo.content}
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {new Date(memo.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}

        {memos.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No memos yet. Create your first memo!
          </div>
        )}
      </div>
    </div>
  )
}
