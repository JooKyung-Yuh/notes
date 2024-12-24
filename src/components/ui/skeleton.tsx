'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${
        className ?? ''
      }`}
    />
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 dark:border-t-blue-400" />
    </div>
  )
}
