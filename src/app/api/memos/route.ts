import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user: User | null
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 },
      )
    }

    const memo = await prisma.memo.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
    })

    return NextResponse.json(memo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '9')
  const query = searchParams.get('q')

  const memos = await prisma.memo.findMany({
    where: {
      userId: session.user.id,
      OR: query
        ? [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json({ memos })
}
