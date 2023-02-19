import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/db"
import bcrypt from 'bcryptjs'

export const authOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            credentials: {
                email: {label: "E-mail", type: "text"},
                password: {label: "Пароль", type: "password"}
            },
            async authorize(credentials, req) {
                // const user = await prisma.user.findFirst({
                //     where: {
                //         username: credentials.username
                //     }
                // })
                
                const password = await prisma.password.findFirst({
                    where: {
                        user: {
                            email: credentials.email
                        }
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    take: 1
                })

                console.log(password)

                if (!password)
                    return null

                if (bcrypt.compareSync(credentials.password, password.hash)) {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: credentials.email
                        }
                    })
                    
                    return { 
                        id: user.id,
                        email: user.email
                    }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: "/login"
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            // console.log(p)
            user && (token.user = user)
            return token
        },
        session: async ({ session, token }) => {
            session.user = token.user
            return session
        }
    }
}

export default NextAuth(authOptions)