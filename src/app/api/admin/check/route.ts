import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({
    isAdmin: isAdmin(session?.user?.email),
  })
}
