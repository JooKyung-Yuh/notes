import { render, screen, fireEvent, waitFor, act } from '../utils/test-utils'
import NewMemoPage from '@/app/(dashboard)/dashboard/memos/new/page'
import { mockRouter } from '../mocks/next-navigation'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
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
