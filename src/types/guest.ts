export interface GuestUser {
  id: string
  name: string
  isGuest: true
  createdAt: string
}

export interface GuestMemo {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
