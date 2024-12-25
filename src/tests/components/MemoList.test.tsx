import { render, screen } from '../utils/test-utils'
import { MemoList } from '@/components/MemoList'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user-id', isGuest: false },
      expires: new Date(Date.now() + 2 * 86400).toISOString(),
    },
    status: 'authenticated',
  }),
}))

// Mock useToast
jest.mock('@/components/ui/toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    toast: jest.fn(),
  }),
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

describe('MemoList', () => {
  it('renders memo list correctly', async () => {
    render(<MemoList initialMemos={mockMemos} />)

    const memo1 = await screen.findByText('Test Memo 1')
    const memo2 = await screen.findByText('Test Memo 2')

    expect(memo1).toBeInTheDocument()
    expect(memo2).toBeInTheDocument()
  })

  it('handles empty memo list', async () => {
    render(<MemoList initialMemos={[]} />)
    const emptyText = await screen.findByText(
      'No memos yet. Create your first memo!',
    )
    expect(emptyText).toBeInTheDocument()
  })

  it('handles search query', async () => {
    render(<MemoList initialMemos={mockMemos} searchQuery="Test" />)

    const marks = await screen.findAllByText('Test', { exact: true })
    expect(marks).toHaveLength(4) // 각 메모의 제목과 용에 하이트된 'Test' 단어
  })
})
