import { GuestUser, GuestMemo } from '@/types/guest'

const isClient = typeof window !== 'undefined'

const STORAGE_KEYS = {
  USER: 'guest_user',
  MEMOS: 'guest_memos',
} as const

export const guestStorage = {
  createGuestUser(): GuestUser {
    if (!isClient) return null

    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      isGuest: true,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser))
    return guestUser
  },

  getGuestUser(): GuestUser | null {
    if (!isClient) return null

    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  },

  getMemos(): GuestMemo[] {
    if (!isClient) return []

    const data = localStorage.getItem(STORAGE_KEYS.MEMOS)
    return data ? JSON.parse(data) : []
  },

  createMemo(title: string, content: string): GuestMemo | null {
    if (!isClient) return null

    const memos = this.getMemos()
    const newMemo = {
      id: `guest_memo_${Date.now()}`,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      STORAGE_KEYS.MEMOS,
      JSON.stringify([...memos, newMemo]),
    )
    return newMemo
  },

  updateMemo(id: string, title: string, content: string): GuestMemo | null {
    if (!isClient) return null

    const memos = this.getMemos()
    const index = memos.findIndex((memo) => memo.id === id)

    if (index === -1) return null

    const updatedMemo = {
      ...memos[index],
      title,
      content,
      updatedAt: new Date().toISOString(),
    }

    memos[index] = updatedMemo
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos))
    return updatedMemo
  },

  deleteMemo(id: string): boolean {
    if (!isClient) return false

    const memos = this.getMemos()
    const filteredMemos = memos.filter((memo) => memo.id !== id)
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(filteredMemos))
    return memos.length !== filteredMemos.length
  },

  clearAll() {
    if (!isClient) return

    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.MEMOS)
  },
}
