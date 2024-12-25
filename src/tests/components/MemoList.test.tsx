import { render, screen } from '../utils/test-utils'
import { MemoList } from '@/components/MemoList'

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
    expect(marks).toHaveLength(4) // 각 메모의 제목과 내용에 하이라이트된 'Test' 단어
  })
})
