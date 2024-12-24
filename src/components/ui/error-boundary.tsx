'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {this.state.error?.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
