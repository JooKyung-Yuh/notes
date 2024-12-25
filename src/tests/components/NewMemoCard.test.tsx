import { render, screen, fireEvent } from '../utils/test-utils'
import { NewMemoCard } from '@/components/NewMemoCard'
import { mockRouter } from '../mocks/next-navigation'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
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
})
