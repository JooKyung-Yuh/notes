import { render, screen } from '../utils/test-utils'
import DashboardPage from '@/app/(dashboard)/dashboard/page'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    memo: {
      findMany: jest.fn(),
    },
  },
}))

const mockMemos = [
  {
    id: '1',
    title: 'Test Memo 1',
    content: 'Test Content 1',
    userId: 'test-user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Memo 2',
    content: 'Test Content 2',
    userId: 'test-user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard with memos when user is authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
    })
    ;(prisma.memo.findMany as jest.Mock).mockResolvedValue(mockMemos)

    const page = await DashboardPage({ searchParams: {} })
    render(page)

    expect(screen.getByText('My Memos')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(screen.getByText('Test Memo 1')).toBeInTheDocument()
    expect(screen.getByText('Test Memo 2')).toBeInTheDocument()
  })

  it('handles search query', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
    })
    ;(prisma.memo.findMany as jest.Mock).mockResolvedValue([mockMemos[0]])

    const page = await DashboardPage({ searchParams: { q: 'Test Memo 1' } })
    render(page)

    expect(screen.getByText('Test Memo 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Memo 2')).not.toBeInTheDocument()
  })

  it('renders empty state when user has no memos', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
    })
    ;(prisma.memo.findMany as jest.Mock).mockResolvedValue([])

    const page = await DashboardPage({ searchParams: {} })
    render(page)

    expect(
      screen.getByText('No memos yet. Create your first memo!'),
    ).toBeInTheDocument()
  })

  it('renders empty state when user is not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const page = await DashboardPage({ searchParams: {} })
    render(page)

    expect(
      screen.getByText('No memos yet. Create your first memo!'),
    ).toBeInTheDocument()
  })
})
