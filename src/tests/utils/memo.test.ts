import {
  sortMemosByDate,
  filterMemosBySearch,
  processMemos,
} from '@/utils/memo'
import { Memo } from '@/types/memo'

describe('Memo utilities', () => {
  const mockMemos: Memo[] = [
    {
      id: '1',
      title: 'Old Memo',
      content: 'Test Content 1',
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'New Memo',
      content: 'Test Content 2',
      updatedAt: new Date('2024-02-01'),
    },
  ]

  describe('sortMemosByDate', () => {
    it('sorts memos by updatedAt in descending order', () => {
      const sorted = sortMemosByDate([...mockMemos])
      expect(sorted[0].title).toBe('New Memo')
      expect(sorted[1].title).toBe('Old Memo')
    })
  })

  describe('filterMemosBySearch', () => {
    it('filters memos by title and content', () => {
      const filtered = filterMemosBySearch(mockMemos, 'Test')
      expect(filtered).toHaveLength(2)

      const filteredByTitle = filterMemosBySearch(mockMemos, 'New')
      expect(filteredByTitle).toHaveLength(1)
      expect(filteredByTitle[0].title).toBe('New Memo')
    })
  })

  describe('processMemos', () => {
    it('processes memos with search query', () => {
      const processed = processMemos(mockMemos, 'New')
      expect(processed).toHaveLength(1)
      expect(processed[0].title).toBe('New Memo')
    })

    it('processes memos without search query', () => {
      const processed = processMemos(mockMemos)
      expect(processed).toHaveLength(2)
      expect(processed[0].title).toBe('New Memo')
    })
  })
})
