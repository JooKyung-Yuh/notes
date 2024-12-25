import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()
const prismaClient = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('Admin credentials not found in environment variables')
    process.exit(1)
  }

  try {
    const existingAdmin = await prismaClient.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
      const hashedPassword = await hash(adminPassword, 12)
      await prismaClient.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
        },
      })
      console.log('Admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
