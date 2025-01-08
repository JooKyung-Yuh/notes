import { Memo } from '@/types/memo'

export function sortMemosByDate<T extends { updatedAt: string }>(
  memos: T[],
): T[] {
  return [...memos].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function searchMemos<T extends { title: string; content: string }>(
  memos: T[],
  query: string,
): T[] {
  const searchQuery = query.toLowerCase()
  return memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(searchQuery) ||
      memo.content.toLowerCase().includes(searchQuery),
  )
}

export function paginateMemos<T extends { id: string }>(
  memos: T[],
  cursor?: string,
  limit: number = 9,
): { items: T[]; nextCursor?: string } {
  const startIndex = cursor ? memos.findIndex((m) => m.id === cursor) + 1 : 0
  const items = memos.slice(startIndex, startIndex + limit)

  return {
    items,
    nextCursor: items.length === limit ? items[items.length - 1].id : undefined,
  }
}
