import { NextResponse } from 'next/server'
import { ApiError } from './errors'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

export function errorResponse(error: ApiError | Error | unknown) {
  const apiError = error instanceof ApiError ? error : handleApiError(error)

  return NextResponse.json(
    {
      success: false,
      error: {
        message: apiError.message,
        details: apiError.details,
      },
    },
    { status: apiError instanceof ApiError ? apiError.statusCode : 500 },
  )
}
