import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/db"
import bcrypt from 'bcryptjs'

export const authOptions = {
    session: {
        jwt: true,
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
                    const user = prisma.user.findFirst({
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
    }
}

export default NextAuth(authOptions)