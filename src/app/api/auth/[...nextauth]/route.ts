import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { guestStorage } from '@/lib/guest-storage'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importGuestMemos(userId: string, guestMemos: any[]) {
  if (!guestMemos || guestMemos.length === 0) return

  await prisma.memo.createMany({
    data: guestMemos.map((memo) => ({
      title: memo.title,
      content: memo.content,
      userId: userId,
      createdAt: new Date(memo.createdAt),
      updatedAt: new Date(memo.updatedAt),
    })),
  })
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
