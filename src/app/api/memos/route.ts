import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { withAuth } from '@/middleware/auth'
import { ApiError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/api-response'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user: User | null
}

export const POST = withAuth(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions)
    const { title, content } = await req.json()

    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required')
    }

    const memo = await prisma.memo.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
    })

    return successResponse(memo, 201)
  } catch (error) {
    return errorResponse(error)
  }
})

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
