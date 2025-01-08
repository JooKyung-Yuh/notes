import { AppError, errorCodes } from './errors'

function handleApiError(error: unknown): AppError {
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  // 데이터베이스 연결 관련 에러 처리
  if (error instanceof Error) {
    if (
      error.message.includes('Connection') ||
      error.message.includes('timeout')
    ) {
      return new AppError(
        errorCodes.INTERNAL_ERROR,
        'Database connection error, please try again',
        503,
      )
    }
    if (error.message.includes('prisma')) {
      return new AppError(
        errorCodes.INTERNAL_ERROR,
        'Database operation failed',
        500,
      )
    }
    return new AppError(errorCodes.INTERNAL_ERROR, error.message, 500)
  }

  return new AppError(
    errorCodes.INTERNAL_ERROR,
    'An unexpected error occurred',
    500,
  )
}

export function successResponse<T>(data: T, status = 200) {
  if (process.env.NODE_ENV === 'test') {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        environment: 'test',
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // Vercel 환경을 위한 캐시 설정
      },
    },
  )
}

export function errorResponse(error: unknown) {
  const apiError = error instanceof AppError ? error : handleApiError(error)

  const responseBody = {
    success: false,
    error: apiError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
  }

  return new Response(JSON.stringify(responseBody), {
    status: apiError.statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NODE_ENV === 'production' && {
        'Cache-Control': 'no-store',
      }),
    },
  })
}
