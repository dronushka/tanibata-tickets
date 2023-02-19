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
        
        const user = await prisma.user.findFirst({
            where: {
                email: validatedEmail
            }
        })

        if (!user) {
            res.status(422).json({error: "user_not_found"})
            return
        }
        
        const password = await createPassword(user, req.body.email)
       
        const info = await sendPassword(validatedEmail, password)
        // console.log(info)
        // res.status(200).json({password})
        res.status(200).end()

        // res.status(422).json({
        //     error: "email can not be validated",
        //     email: req.body.email
        // })
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