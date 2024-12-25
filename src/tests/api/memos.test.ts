import { POST, GET } from '@/app/api/memos/route'
import { PUT, DELETE, GET as GET_BY_ID } from '@/app/api/memos/[id]/route'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    memo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Memos API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/memos', () => {
    it('should create a new memo', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.599Z')
      const mockMemo = {
        id: '1',
        title: 'Test Memo',
        content: 'Test Content',
        userId: 'test-user-id',
        createdAt: mockDate,
        updatedAt: mockDate,
      }

      ;(prisma.memo.create as jest.Mock).mockResolvedValue({
        ...mockMemo,
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      })

      const req = new Request('http://localhost:3000/api/memos', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Memo',
          content: 'Test Content',
        }),
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data).toEqual({
        ...mockMemo,
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      })
    })
  })

  describe('GET /api/memos', () => {
    it('should return memos list', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.608Z')
      const mockMemos = [
        {
          id: '1',
          title: 'Test Memo',
          content: 'Test Content',
          userId: 'test-user-id',
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
        },
      ]

      ;(prisma.memo.findMany as jest.Mock).mockResolvedValue(mockMemos)

      const req = new Request('http://localhost:3000/api/memos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toEqual(mockMemos)
    })

    it('should return 401 when user is not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: null,
      })

      const req = new Request('http://localhost:3000/api/memos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle invalid page number', async () => {
      const req = new Request('http://localhost:3000/api/memos?page=invalid', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toBeDefined()
      expect(prisma.memo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
          take: 10,
          where: expect.any(Object),
        }),
      )
    })

    it('should handle invalid limit number', async () => {
      const req = new Request('http://localhost:3000/api/memos?limit=invalid', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toBeDefined()
      expect(prisma.memo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
          take: 10,
          where: expect.any(Object),
        }),
      )
    })

    it('should handle empty search query', async () => {
      ;(prisma.memo.findMany as jest.Mock).mockResolvedValue([])

      const req = new Request('http://localhost:3000/api/memos?q=')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toEqual([])
    })

    it('should return memos with cursor', async () => {
      const req = new Request('http://localhost:3000/api/memos')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
    })

    it('should handle cursor-based pagination', async () => {
      const req = new Request('http://localhost:3000/api/memos?cursor=10')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/memos with infinite scroll', () => {
    it('should return memos with cursor', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.608Z')
      const mockMemos = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Test Memo ${i + 1}`,
        content: `Test Content ${i + 1}`,
        userId: 'test-user-id',
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      }))

      ;(prisma.memo.findMany as jest.Mock).mockResolvedValue(mockMemos)

      const req = new Request('http://localhost:3000/api/memos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toHaveLength(9)
      expect(data.data.nextCursor).toBe('10')
    })

    it('should handle cursor-based pagination', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.608Z')
      const mockMemos = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 11}`,
        title: `Test Memo ${i + 11}`,
        content: `Test Content ${i + 11}`,
        userId: 'test-user-id',
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      }))

      ;(prisma.memo.findMany as jest.Mock).mockResolvedValue(mockMemos)

      const req = new Request('http://localhost:3000/api/memos?cursor=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toEqual(mockMemos)
      expect(data.data.nextCursor).toBeUndefined()
    })
  })

  describe('GET /api/memos with search', () => {
    it('should return filtered memos by search query', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.608Z')
      const mockMemos = [
        {
          id: '1',
          title: 'Search Test Memo',
          content: 'Searchable Content',
          userId: 'test-user-id',
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
        },
      ]

      ;(prisma.memo.findMany as jest.Mock).mockResolvedValue(mockMemos)

      const searchParams = new URLSearchParams({ q: 'search' })
      const req = new Request(
        `http://localhost:3000/api/memos?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.memos).toEqual(mockMemos)
    })
  })

  describe('PUT /api/memos/:id', () => {
    it('should update an existing memo', async () => {
      const mockDate = new Date('2024-12-25T10:05:49.599Z')
      const mockMemo = {
        id: '1',
        title: 'Updated Memo',
        content: 'Updated Content',
        userId: 'test-user-id',
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      }

      ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue({
        ...mockMemo,
        userId: 'test-user-id',
      })
      ;(prisma.memo.update as jest.Mock).mockResolvedValue(mockMemo)

      const req = new Request('http://localhost:3000/api/memos/1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Memo',
          content: 'Updated Content',
        }),
      })

      const response = await PUT(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockMemo)
    })
  })

  describe('DELETE /api/memos/:id', () => {
    it('should delete a memo', async () => {
      ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        userId: 'test-user-id',
      })
      ;(prisma.memo.delete as jest.Mock).mockResolvedValue({})

      const req = new Request('http://localhost:3000/api/memos/1', {
        method: 'DELETE',
      })

      const response = await DELETE(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.message).toBe('Memo deleted')
    })
  })

  describe('Error cases', () => {
    describe('POST /api/memos', () => {
      it('should return 400 when title is missing', async () => {
        const req = new Request('http://localhost:3000/api/memos', {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test Content',
          }),
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Title and content are required')
      })

      it('should return 401 when user is not authenticated', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValueOnce({
          user: null,
        })

        const req = new Request('http://localhost:3000/api/memos', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Test Memo',
            content: 'Test Content',
          }),
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })
    })

    describe('PUT /api/memos/:id', () => {
      it('should return 404 when memo does not exist', async () => {
        ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue(null)

        const req = new Request('http://localhost:3000/api/memos/999', {
          method: 'PUT',
          body: JSON.stringify({
            title: 'Updated Memo',
            content: 'Updated Content',
          }),
        })

        const response = await PUT(req, { params: { id: '999' } })
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Not found')
      })

      it('should return 404 when user is not the owner', async () => {
        ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          userId: 'other-user-id',
        })

        const req = new Request('http://localhost:3000/api/memos/1', {
          method: 'PUT',
          body: JSON.stringify({
            title: 'Updated Memo',
            content: 'Updated Content',
          }),
        })

        const response = await PUT(req, { params: { id: '1' } })
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Not found')
      })
    })

    describe('GET /api/memos/:id', () => {
      it('should return 401 when user is not authenticated', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValueOnce({
          user: null,
        })

        const req = new Request('http://localhost:3000/api/memos/1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const response = await GET_BY_ID(req, { params: { id: '1' } })
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 404 when memo does not exist', async () => {
        ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue(null)

        const req = new Request('http://localhost:3000/api/memos/999', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const response = await GET_BY_ID(req, { params: { id: '999' } })
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Memo not found')
      })

      it('should return 403 when accessing other user memo', async () => {
        ;(prisma.memo.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          userId: 'other-user-id',
          title: 'Test',
          content: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const req = new Request('http://localhost:3000/api/memos/1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const response = await GET_BY_ID(req, { params: { id: '1' } })
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })
  })
})
