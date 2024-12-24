import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Memo Service',
  description: 'Login or register to access your memos',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="w-full max-w-[400px] p-6">{children}</div>
    </div>
  )
}
