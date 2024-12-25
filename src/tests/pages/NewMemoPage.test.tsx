import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import NewMemoPage from '@/app/(dashboard)/dashboard/memos/new/page'
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

describe('NewMemoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders new memo page correctly', () => {
    render(<NewMemoPage />)

    expect(screen.getByText('New Memo')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Memo' }),
    ).toBeInTheDocument()
  })

  it('handles guest mode memo creation correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { isGuest: true } },
    })

    render(<NewMemoPage />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Title' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Test Content' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Memo' }))

    await waitFor(() => {
      expect(guestStorage.createMemo).toHaveBeenCalledWith(
        'Test Title',
        'Test Content',
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles regular user memo creation correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '123', isGuest: false } },
    })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })

    it('handles form inputs correctly', async () => {
      render(<NewMemoPage />)

      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Test Title' },
      })
      fireEvent.change(screen.getByLabelText('Content'), {
        target: { value: 'Test Content' },
      })
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument()
    })
  })
})
