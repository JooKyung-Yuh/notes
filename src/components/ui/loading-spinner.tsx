'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full min-h-[400px]">
      <div className="relative w-10 h-10">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-800 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin border-t-transparent" />
      </div>
    </div>
  )
}
