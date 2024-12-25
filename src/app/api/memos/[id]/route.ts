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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updatedMemo = await prisma.memo.update({
      where: { id: params.id },
      data: { title, content },
    })

    return NextResponse.json(updatedMemo)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo || memo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.memo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Memo deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
    })

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 })
    }

    // 본인의 메모만 조회 가능
    if (memo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(memo)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
