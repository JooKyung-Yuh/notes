export interface GuestUser {
  id: string
  name: string
  isGuest: true
  createdAt: string
  email: string | null
  image: string | null
}

export interface GuestMemo {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
