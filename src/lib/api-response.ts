import { Response } from 'node-fetch'
import { ApiError } from './errors'

function handleApiError(error: unknown): ApiError {
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message)
  }

  return new ApiError(500, 'An unexpected error occurred')
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
  const apiError = error instanceof ApiError ? error : handleApiError(error)

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
