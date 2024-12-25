import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    isAdmin?: boolean
  }

  interface Session {
    user: User
  }
}
