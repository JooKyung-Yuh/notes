import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock Request and Response
class MockRequest {
  constructor(input: string | URL, init?: RequestInit) {
    return {
      url: input,
      method: init?.method || 'GET',
      headers: init?.headers || {},
      body: init?.body,
      json: async () => {
        if (!init?.body) return {}
        return JSON.parse(init.body as string)
      },
    }
  }
}

global.Request = MockRequest as any
global.Response = class {
  constructor(body: any, init?: ResponseInit) {
    return {
      json: async () => JSON.parse(body),
      status: init?.status || 200,
    }
  }
} as any

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  constructor() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mocks
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) =>
      new Response(JSON.stringify(body), init),
  },
  NextRequest: MockRequest,
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    memo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(),
}))
