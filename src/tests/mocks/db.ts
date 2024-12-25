import { PrismaClient } from '@prisma/client'

export const mockPrisma = ({
  memo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
} as unknown) as PrismaClient

export const prisma = mockPrisma
