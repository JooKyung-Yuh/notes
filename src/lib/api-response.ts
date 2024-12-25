import { Response } from 'node-fetch'
import { ApiError } from './errors'

function handleApiError(error: unknown): ApiError {
  console.error('API Error:', error)

  if (error instanceof Error) {
    return new ApiError(500, error.message)
  }

  return new ApiError(500, 'An unexpected error occurred')
}

export function successResponse<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export function errorResponse(error: unknown) {
  const apiError = error instanceof ApiError ? error : handleApiError(error)

  return new Response(
    JSON.stringify({
      success: false,
      error: apiError.message,
    }),
    {
      status: apiError.statusCode,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
