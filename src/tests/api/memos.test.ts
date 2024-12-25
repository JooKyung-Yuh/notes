import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/memos/route'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

describe('POST /api/memos', () => {
  let user: any

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await hash('password123', 12),
      },
    })
  })

  it('should create a new memo', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Memo',
        content: 'Test Content',
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Test Memo')
    expect(data.userId).toBe(user.id)
  })
})
