export const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

export const mockUseSearchParams = () => new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockUseSearchParams(),
  usePathname: () => '/',
}))

export const MockNextNavigation = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return children
}
