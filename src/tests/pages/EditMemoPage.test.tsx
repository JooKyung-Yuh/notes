import { render, screen, fireEvent, waitFor, act } from '../utils/test-utils'
import EditMemoPage from '@/app/(dashboard)/dashboard/memos/[id]/edit/page'
import { mockRouter } from '../mocks/next-navigation'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
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
      ok: true,
      json: () => Promise.resolve(mockMemo),
    })

    global.fetch = mockFetch
    render(<EditMemoPage params={{ id: '1' }} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Memo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument()
    })
  })
})
