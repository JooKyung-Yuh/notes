import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { ApiError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/api-response'
import { Session } from 'next-auth'
import { guestStorage } from '@/lib/guest-storage'

export async function POST(req: Request): Promise<Response> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { title, content } = await req.json()

    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required')
    }

    if (session.user.isGuest) {
      const memo = guestStorage.createMemo(title, content)
      return successResponse(memo, 201)
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

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const searchParams = request.nextUrl?.searchParams
    const cursor = searchParams?.get('cursor')
    const limit = 9
    const query = searchParams?.get('q')

    if (session.user.isGuest) {
      const guestMemos = guestStorage.getMemos()
      let filteredMemos = guestMemos

      if (query) {
        filteredMemos = guestMemos.filter(
          (memo) =>
            memo.title.toLowerCase().includes(query.toLowerCase()) ||
            memo.content.toLowerCase().includes(query.toLowerCase()),
        )
      }

      const startIndex = cursor
        ? guestMemos.findIndex((m) => m.id === cursor) + 1
        : 0
      const paginatedMemos = filteredMemos.slice(startIndex, startIndex + limit)

      const nextCursor =
        paginatedMemos.length === limit
          ? paginatedMemos[paginatedMemos.length - 1].id
          : undefined

      return successResponse({
        memos: paginatedMemos,
        nextCursor,
      })
    }

    // 일반 사용자의 메모 조회
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
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    })

    return successResponse({
      memos,
      nextCursor:
        memos.length === limit ? memos[memos.length - 1].id : undefined,
    })
  } catch (error) {
    console.error('Error in GET /api/memos:', error)
    return errorResponse(error)
  }
}
