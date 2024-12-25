import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NewMemoCard } from '@/components/NewMemoCard'
import { MemoList } from '@/components/MemoList'
import { Search } from '@/components/ui/search'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
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
  const memos = session?.user?.id
    ? await getInitialMemos(session.user.id, searchParams.q)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Memos</h1>
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
