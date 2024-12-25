'use client'

import { SessionProvider } from './SessionProvider'
import { Providers as ThemeProviders } from '@/app/providers'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProviders>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProviders>
    </SessionProvider>
  )
}
