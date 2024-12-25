import { render, screen, fireEvent, waitFor, act } from '../utils/test-utils'
import EditMemoPage from '@/app/(dashboard)/dashboard/memos/[id]/edit/page'
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
    getMemo: jest.fn(),
    updateMemo: jest.fn(),
  },
}))

const mockMemo = {
  id: '1',
  title: 'Test Memo',
  content: 'Test Content',
}

describe('EditMemoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('handles guest mode editing correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { isGuest: true } },
    })
    ;(guestStorage.getMemo as jest.Mock).mockReturnValue(mockMemo)
    ;(guestStorage.updateMemo as jest.Mock).mockReturnValue({
      ...mockMemo,
      title: 'Updated Title',
      content: 'Updated Content',
    })

    render(<EditMemoPage params={{ id: '1' }} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Memo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument()
    })

    // Update form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Title' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Updated Content' },
    })

    // Submit form
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(guestStorage.updateMemo).toHaveBeenCalledWith(
        '1',
        'Updated Title',
        'Updated Content',
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('renders loading state initially', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) => setTimeout(() => resolve(mockMemo), 1000)),
    })

    global.fetch = mockFetch
    render(<EditMemoPage params={{ id: '1' }} />)

    const loadingElement = await screen.findByTestId('loading-skeleton')
    expect(loadingElement).toBeInTheDocument()
    expect(loadingElement).toHaveClass('animate-pulse')
  })

  it('fetches and displays memo data', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockMemo),
      json: () => Promise.resolve({ data: mockMemo }),
    })

    global.fetch = mockFetch
    render(<EditMemoPage params={{ id: '1' }} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Memo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument()
    })
  })
})
