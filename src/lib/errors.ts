export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export function createErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  // 예상치 못한 에러 처리
  console.error('Unexpected error:', error)
  return {
    success: false,
    data: null,
    error: {
      code: errorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  }
}
