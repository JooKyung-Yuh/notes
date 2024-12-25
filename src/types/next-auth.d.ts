import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    isGuest?: boolean
    isAdmin?: boolean
  }

  interface Session {
    user: User
  }
}
