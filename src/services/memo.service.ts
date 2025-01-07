import { prisma } from '@/lib/db'
import { Memo } from '@/types/memo'
import { ApiError } from '@/lib/errors'

export class MemoService {
  static async createMemo(
    userId: string,
    data: Pick<Memo, 'title' | 'content'>,
  ) {
    return prisma.memo.create({
      data: { ...data, userId },
    })
  }

  static async getMemos(
    userId: string,
    options: {
      cursor?: string
      limit?: number
      query?: string
    },
  ) {
    // 기존 GET 로직 이동
  }
}
