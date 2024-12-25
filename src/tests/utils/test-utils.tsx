import { render } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import React from 'react'

// Mock session data
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    isGuest: false,
  },
}

// Mock ToastProvider
const MockToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <MockToastProvider>{children}</MockToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: Providers,
    ...options,
  })
}

export * from '@testing-library/react'
export { customRender as render }
