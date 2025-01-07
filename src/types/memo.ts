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
