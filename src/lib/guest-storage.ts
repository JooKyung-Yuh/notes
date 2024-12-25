import { GuestUser, GuestMemo } from '@/types/guest'

const isClient = typeof window !== 'undefined'

const STORAGE_KEYS = {
  USER: 'guest_user',
  MEMOS: 'guest_memos',
} as const

interface GuestStorage {
  createGuestUser: () => GuestUser
  getGuestUser: () => GuestUser | null
  getMemos: () => GuestMemo[]
  getMemo: (id: string) => GuestMemo | null
  createMemo: (title: string, content: string) => GuestMemo | null
  updateMemo: (id: string, title: string, content: string) => GuestMemo | null
  deleteMemo: (id: string) => boolean
  clearAll: () => void
}

export const guestStorage: GuestStorage = {
  createGuestUser(): GuestUser {
    if (!isClient) {
      return {
        id: '',
        isGuest: true,
        name: 'Guest',
        email: null,
        image: null,
        createdAt: new Date().toISOString(),
      }
    }

    const guestUser: GuestUser = {
      id: `guest_${Date.now()}`,
      isGuest: true as const,
      name: 'Guest',
      email: null,
      image: null,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('guestUser', JSON.stringify(guestUser))
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

  getMemo(id: string): GuestMemo | null {
    if (!isClient) return null

    const memos = this.getMemos()
    return memos.find((memo) => memo.id === id) || null
  },
}
