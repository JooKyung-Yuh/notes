export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: ApiError
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor?: string
  total?: number
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export type ApiErrorResponse = ApiResponse<null>
