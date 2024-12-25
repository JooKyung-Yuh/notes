import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, guestMemos } = await req.json()

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      )
    }

    // 비밀번호 유효성 검사 (최소 6자)
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 },
    )
  }
}
