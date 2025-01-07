import { PrismaClient } from '@prisma/client'
import { backOff } from 'exponential-backoff'
import { Pool } from '@neondatabase/serverless'

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1초
const MAX_RETRY_DELAY = 5000 // 5초

class DatabaseClient {
  private static instance: PrismaClient
  private static pool: Pool

  private static async initializePool() {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        maxConnections: 10,
        idleTimeout: 60000, // 60초
        connectionTimeoutMillis: 10000, // 10초
      })
    }
    return this.pool
  }

  private static async createPrismaClient() {
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // 연결 재시도 로직
    await backOff(
      async () => {
        try {
          await client.$connect()
          return true
        } catch (error) {
          console.error('Database connection failed:', error)
          throw error
        }
      },
      {
        numOfAttempts: MAX_RETRIES,
        startingDelay: INITIAL_RETRY_DELAY,
        maxDelay: MAX_RETRY_DELAY,
        retry: (error, attemptNumber) => {
          console.warn(`Retry attempt ${attemptNumber}:`, error)
          return true
        },
      },
    )

    return client
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = await this.createPrismaClient()
      await this.initializePool()
    }
    return this.instance
  }

  static async disconnect() {
    if (this.instance) {
      await this.instance.$disconnect()
    }
    if (this.pool) {
      await this.pool.end()
    }
  }
}

// 글로벌 타입 선언
declare global {
  var prisma: PrismaClient | undefined
}

// 프리즈마 클라이언트 초기화
export const prisma = globalThis.prisma ?? (await DatabaseClient.getInstance())

// 개발 환경에서만 글로벌 객체에 할당
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// 서버 종료 시 연결 해제
process.on('beforeExit', async () => {
  await DatabaseClient.disconnect()
})
