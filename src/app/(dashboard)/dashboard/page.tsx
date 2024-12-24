import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NewMemoCard } from '@/components/NewMemoCard'
import { MemoList } from '@/components/MemoList'

async function getInitialMemos(userId: string) {
  const limit = 9
  const memos = await prisma.memo.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })

  return memos
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const memos = session?.user?.id ? await getInitialMemos(session.user.id) : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Memos</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NewMemoCard />
        <MemoList initialMemos={memos} />
      </div>
    </div>
  )
}
