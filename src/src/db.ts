import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const createPassword = async (user: User, email: string): Promise<string> => {
  const randomDigit = () => {
    return String(Math.floor(Math.random() * 10))
  }

  let randomPassword = randomDigit() + randomDigit() + randomDigit() + randomDigit() + randomDigit() + randomDigit()

  await prisma.password.create({
    data: {
      hash: bcrypt.hashSync(randomPassword, 10),
      user: {
        connect: {
            id: user.id
        }
      }
    }
  })

  return randomPassword
}