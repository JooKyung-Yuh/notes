import { Memo } from '@/types/memo'

export const sortMemosByDate = (memos: Memo[]): Memo[] => {
  return [...memos].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export const searchMemos = (memos: Memo[], query: string): Memo[] => {
  const searchQuery = query.toLowerCase()
  return memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(searchQuery) ||
      memo.content.toLowerCase().includes(searchQuery),
  )
}

export const paginateMemos = (
  memos: Memo[],
  cursor?: string,
  limit: number = 9,
): { items: Memo[]; nextCursor?: string } => {
  const startIndex = cursor ? memos.findIndex((m) => m.id === cursor) + 1 : 0
  const items = memos.slice(startIndex, startIndex + limit)

  return {
    items,
    nextCursor: items.length === limit ? items[items.length - 1].id : undefined,
  }
}
