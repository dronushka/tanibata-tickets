import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, createPassword } from "@/db"
import { z, ZodError } from 'zod'
import { sendPassword } from '@/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "POST")
        res.status(405).end()
    
    const emailValidator = z.string().email()

    try {
        const validatedEmail = emailValidator.parse(req.body.email)
        
        let user = await prisma.user.findFirst({
            where: {
                email: validatedEmail
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: validatedEmail,
                    role: {
                        connect: { name: "customer" }
                    }
                }
            })
        }
        
        if (!user) {
            res.status(422).json({error: "cannot_create_user"})
            return
        }
        
        const password = await createPassword(user, req.body.email)
       
        if (!password) {
            res.status(422).json({error: "cannot_create_password"})
            return
        }
        
        await sendPassword(validatedEmail, password)

        res.status(200).end()

    } catch (e: any) {
        console.error(e)
        let message: any = ""
        if (e instanceof ZodError)
            message = e.flatten().formErrors.join(", ")
        else if (e instanceof Error)
            message = e.message
        res.status(422).json({
            error: message
        })
    } 
}