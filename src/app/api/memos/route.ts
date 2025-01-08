import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { Session } from 'next-auth'
import { guestStorage } from '@/lib/guest-storage'
import { sortMemosByDate, searchMemos, paginateMemos } from '@/utils/memo'
import { AppError } from '@/lib/errors'
import { errorCodes } from '@/lib/errors'

export async function POST(req: Request): Promise<Response> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      throw new AppError(errorCodes.UNAUTHORIZED, 'Unauthorized', 401)
    }

    const { title, content } = await req.json()

    if (!title || !content) {
      throw new AppError(
        errorCodes.VALIDATION_ERROR,
        'Title and content are required',
        400,
      )
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
      throw new AppError(
        errorCodes.UNAUTHORIZED,
        'Authentication required',
        401,
      )
    }

    const searchParams = request.nextUrl?.searchParams
    const cursor = searchParams?.get('cursor') || undefined
    const query = searchParams?.get('q') || undefined

    if (session.user.isGuest) {
      const guestMemos = guestStorage.getMemos()
      const sortedMemos = sortMemosByDate(guestMemos)
      const filteredMemos = query
        ? searchMemos(sortedMemos, query)
        : sortedMemos
      const { items, nextCursor } = paginateMemos(filteredMemos, cursor)

      return successResponse({
        memos: items,
        nextCursor,
      })
    }

    // 일반 사용자의 메모 조회
    try {
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
        take: 9,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      })

      return successResponse({
        memos,
        nextCursor: memos.length === 9 ? memos[memos.length - 1].id : undefined,
      })
    } catch (dbError) {
      throw new AppError(
        errorCodes.INTERNAL_ERROR,
        'Database error occurred',
        500,
        dbError,
      )
    }
  } catch (error) {
    return errorResponse(error)
  }
}
