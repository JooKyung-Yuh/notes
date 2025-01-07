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
  guestId: string
  title: string
  content: string
  images?: string[]
  createdAt: string
  updatedAt: string
}
