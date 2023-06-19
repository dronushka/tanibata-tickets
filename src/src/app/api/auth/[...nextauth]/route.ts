import NextAuth, { NextAuthOptions, SessionUser } from 'next-auth'
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/db"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { sendVerificationRequest } from '@/lib/mail'

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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }