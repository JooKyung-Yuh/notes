import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from 'next-themes'

export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}
