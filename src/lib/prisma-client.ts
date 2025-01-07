import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

export function createPrismaClientInstance(adapter?: PrismaNeon): PrismaClient {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

  if (adapter) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    // @ts-ignore - Prisma doesn't expose adapter property types
    prisma.$connect = () => adapter.connect()
    // @ts-ignore
    prisma.$disconnect = async () => {
      try {
        await pool.end()
      } catch (error) {
        console.error('Error disconnecting from database:', error)
      }
    }
  }

  return prisma
}
