import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string
    image?: string
    isGuest?: boolean
  }

  interface Session {
    user: User
  }
}
