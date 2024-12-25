import { errorResponse } from '@/lib/api-response'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Session } from 'next-auth'

export async function withAuth(
  handler: Function,
  options: { adminOnly?: boolean } = {},
) {
  return async function (req: Request, ...args: any[]) {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (options.adminOnly && !session.user.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return handler(req, ...args)
    } catch (error) {
      return errorResponse(error)
    }
  }
}
