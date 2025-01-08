import { getServerSession } from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { AppError, errorCodes } from '@/lib/errors'
import { Session } from 'next-auth'

function successResponse(data: any) {
  return NextResponse.json({ data }, { status: 200 })
}

function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      throw new AppError(errorCodes.UNAUTHORIZED, 'Unauthorized', 401)
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo) {
      throw new AppError(errorCodes.NOT_FOUND, 'Memo not found', 404)
    }

    if (memo.userId !== session.user.id) {
      throw new AppError(errorCodes.UNAUTHORIZED, 'Forbidden', 403)
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
      throw new AppError(errorCodes.UNAUTHORIZED, 'Unauthorized', 401)
    }

    const { title, content } = await req.json()
    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      throw new AppError(errorCodes.NOT_FOUND, 'Not found', 404)
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
      throw new AppError(errorCodes.UNAUTHORIZED, 'Unauthorized', 401)
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      throw new AppError(errorCodes.NOT_FOUND, 'Not found', 404)
    }

    await prisma.memo.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Memo deleted' })
  } catch (error) {
    return errorResponse(error)
  }
}
