import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { createPrismaClientInstance } from './prisma-client'

class DatabaseClient {
  private static instance: DatabaseClient
  private pool: Pool | null = null
  private adapter: PrismaNeon | null = null
  private isDisconnecting = false
  private prismaClient: PrismaClient | null = null

  private constructor() {}

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient()
    }
    return DatabaseClient.instance
  }

  async connect() {
    if (!this.prismaClient) {
      this.pool = new Pool({ connectionString: process.env.DATABASE_URL })
      this.adapter = new PrismaNeon(this.pool)
      this.prismaClient = createPrismaClientInstance(this.adapter)
    }
    return this.prismaClient
  }

  async disconnect() {
    if (this.isDisconnecting) return

    this.isDisconnecting = true
    try {
      await this.prismaClient?.$disconnect()
      await this.pool?.end()
      this.pool = null
      this.adapter = null
      this.prismaClient = null
      this.isDisconnecting = false
    } catch (error) {
      this.isDisconnecting = false
      throw error
    }
  }

  getPrismaClient() {
    if (!this.prismaClient) {
      throw new Error('Database not connected')
    }
    return this.prismaClient
  }
}

// 싱글톤 인스턴스 생성
const dbClient = DatabaseClient.getInstance()

// 프로세스 종료 시 연결 해제
process.on('beforeExit', async () => {
  await dbClient.disconnect()
})

// 초기 연결 설정
await dbClient.connect()

// prisma 클라이언트 export
export const prisma = dbClient.getPrismaClient()
