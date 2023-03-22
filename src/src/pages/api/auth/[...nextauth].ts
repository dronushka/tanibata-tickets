import NextAuth, { NextAuthOptions, SessionUser } from 'next-auth'
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from 'bcryptjs'
import { Role, User } from '@prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { sendVerificationRequest } from '@/mail'

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "database",
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            sendVerificationRequest,
          }),
    ],
    pages: {
        signIn: "/login",
        error: "/auth_error"
    },
    callbacks: {
        session: async ({ session }) => {
            const user = await prisma.user.findUnique({ 
                where: { email: session.user.email }
            })

            if (!user)
                throw new Error("user_not_found")

            session.user = { 
                id: user.id,
                email: user.email,
                role: user.role
            }
            
            return session
        }
    }
}

export default NextAuth(authOptions)
