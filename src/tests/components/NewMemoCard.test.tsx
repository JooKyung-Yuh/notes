import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { NewMemoCard } from '@/components/NewMemoCard'
import { mockRouter } from '../mocks/next-navigation'
import { useSession } from 'next-auth/react'
import { guestStorage } from '@/lib/guest-storage'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

jest.mock('@/lib/guest-storage', () => ({
  guestStorage: {
    createMemo: jest.fn(),
  },
}))

describe('NewMemoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders new memo card correctly', () => {
    render(<NewMemoCard />)
    expect(screen.getByText('New Memo')).toBeInTheDocument()
  })

  it('shows edit form when clicked', () => {
    render(<NewMemoCard />)
    fireEvent.click(screen.getByRole('button'))

    // form 요소 대신 input과 textarea로 확인
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Write your memo...'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('handles guest mode memo creation correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { isGuest: true } },
    })

    render(<NewMemoCard />)

    // Open form
    fireEvent.click(screen.getByRole('button'))

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Test Title' },
    })
    fireEvent.change(screen.getByPlaceholderText('Write your memo...'), {
      target: { value: 'Test Content' },
    })

    // Submit form
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(guestStorage.createMemo).toHaveBeenCalledWith(
        'Test Title',
        'Test Content',
      )
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('handles regular user memo creation correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '123', isGuest: false } },
    })
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true })

    render(<NewMemoCard />)

    // Open form
    fireEvent.click(screen.getByRole('button'))

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Test Title' },
    })
    fireEvent.change(screen.getByPlaceholderText('Write your memo...'), {
      target: { value: 'Test Content' },
    })

    // Submit form
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Title', content: 'Test Content' }),
      })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })
})
