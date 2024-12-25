import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { MemoCard } from '@/components/MemoCard'
import { mockRouter } from '../mocks/next-navigation'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

const mockMemo = {
  id: '1',
  title: 'Test Memo',
  content: 'Test Content',
  updatedAt: new Date('2024-01-01'),
}

describe('MemoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders memo card correctly', () => {
    render(<MemoCard {...mockMemo} />)

    expect(screen.getByText('Test Memo')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('1/1/2024')).toBeInTheDocument()
  })

  it('shows edit form when edit button is clicked', () => {
    render(<MemoCard {...mockMemo} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByDisplayValue('Test Memo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument()
  })

  it('handles update correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    })

    render(<MemoCard {...mockMemo} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/memos/1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Test Memo',
          content: 'Test Content',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('handles delete correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    })

    render(<MemoCard {...mockMemo} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/memos/1', {
        method: 'DELETE',
      })
    })
  })

  it('highlights search query in title and content', () => {
    render(<MemoCard {...mockMemo} searchQuery="Test" />)

    const highlights = screen.getAllByText('Test')
    expect(highlights).toHaveLength(2)
  })

  it('handles error on update', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to update'),
    )

    render(<MemoCard {...mockMemo} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Failed to update')).toBeInTheDocument()
    })
  })

  it('handles error on delete', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to delete'),
    )

    render(<MemoCard {...mockMemo} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument()
    })
  })
})
