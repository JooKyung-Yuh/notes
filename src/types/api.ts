export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor?: string
  total?: number
}
