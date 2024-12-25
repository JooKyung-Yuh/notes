import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { ApiError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo) {
      throw new ApiError(404, 'Memo not found')
    }

    if (memo.userId !== session.user.id) {
      throw new ApiError(403, 'Forbidden')
    }

    return successResponse(memo)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { title, content } = await req.json()
    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      throw new ApiError(404, 'Not found')
    }

    const updatedMemo = await prisma.memo.update({
      where: { id: params.id },
      data: { title, content },
    })

    return successResponse(updatedMemo)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError(401, 'Unauthorized')
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      throw new ApiError(404, 'Not found')
    }

    await prisma.memo.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Memo deleted' })
  } catch (error) {
    return errorResponse(error)
  }
}
