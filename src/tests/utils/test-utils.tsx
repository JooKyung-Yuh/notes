import { render } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { Providers } from '@/app/providers'
import { ToastProvider } from '@/components/ui/toast'

const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { name: 'Test User', email: 'test@example.com' },
}

export const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <SessionProvider session={mockSession}>
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </SessionProvider>
    ),
    ...options,
  })

export * from '@testing-library/react'
export { customRender as render }
