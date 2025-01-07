export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message }
  }
  console.error('Unhandled error:', error)
  return { statusCode: 500, message: 'Internal server error' }
}
