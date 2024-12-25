import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { ApiError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/api-response'
import { Session } from 'next-auth'

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

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
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const searchParams = request.nextUrl?.searchParams
    const cursor = searchParams?.get('cursor')
    const limit = 9
    const query = searchParams?.get('q')

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
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    })

    let nextCursor: string | undefined
    if (memos.length > limit) {
      const nextItem = memos.pop()
      nextCursor = nextItem?.id
    }

    return successResponse({
      memos,
      nextCursor,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
