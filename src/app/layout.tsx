import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: 'Memo Service',
  description: 'A simple memo service built with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
