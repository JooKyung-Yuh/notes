import { renderHook, act, waitFor } from '@testing-library/react'
import { useMemoList } from '@/hooks/useMemoList'

const mockMemos = [
  {
    id: '1',
    title: 'Test Memo 1',
    content: 'Test Content 1',
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: '2',
    title: 'Test Memo 2',
    content: 'Test Content 2',
    updatedAt: new Date('2024-01-01').toISOString(),
  },
]

describe('useMemoList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles loading state', async () => {
    const mockFetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ memos: [] }),
              }),
            100,
          ),
        ),
    )
    global.fetch = mockFetch

    const { result } = renderHook(() => useMemoList(mockMemos))

    act(() => {
      const callback = mockIntersectionObserver.mock.calls[0][0]
      callback([{ isIntersecting: true }])
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
