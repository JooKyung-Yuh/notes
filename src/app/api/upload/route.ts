import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppError, errorCodes } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new AppError(errorCodes.UNAUTHORIZED, 'Unauthorized', 401)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file.type.startsWith('image/')) {
      throw new AppError(errorCodes.VALIDATION_ERROR, 'Invalid file type', 400)
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(errorCodes.VALIDATION_ERROR, 'File too large', 400)
    }

    // Vercel Blob Storage에 업로드
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
