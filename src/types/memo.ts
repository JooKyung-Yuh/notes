export interface Memo {
  id: string
  title: string
  content: string
  images?: string[]
  updatedAt: Date | string
  userId: string
  createdAt: Date | string
}

export interface MemoListProps {
  initialMemos: Memo[]
  searchQuery?: string
}

export interface GuestMemo {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
}
