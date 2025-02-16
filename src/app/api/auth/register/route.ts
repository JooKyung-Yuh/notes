import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { AppError, errorCodes } from '@/lib/errors'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, guestMemos } = await req.json()

    if (!email || !email.includes('@')) {
      throw new AppError(
        errorCodes.VALIDATION_ERROR,
        'Invalid email address',
        400,
      )
    }

    if (!password || password.length < 6) {
      throw new AppError(
        errorCodes.VALIDATION_ERROR,
        'Password must be at least 6 characters',
        400,
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 12)

    // 트랜잭션으로 사용자 생성과 메모 이전을 함께 처리
    const user = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      })

      // 게스트 메모가 있다면 새 계정으로 이전
      if (guestMemos && guestMemos.length > 0) {
        await tx.memo.createMany({
          data: guestMemos.map((memo: any) => ({
            title: memo.title,
            content: memo.content,
            userId: newUser.id,
            createdAt: new Date(memo.createdAt),
            updatedAt: new Date(memo.updatedAt),
          })),
        })
      }

      return newUser
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
