import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z, ZodError } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { OrderStatus, Role } from '@prisma/client'
import { emailTransporter } from '@/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()
        
    const validator = z.object({
        id: z.number()
    })

    try {
        const validated = validator.parse({
            id: Number(req.body.orderId)
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.id
            }
        })

        if (order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        await prisma.order.update({
            where: {
                id: order?.id,
            },
            data: {
                status: OrderStatus.RETURN_REQUESTED
            }
        })

        const admins = await prisma.user.findMany({
            where: {
                role: Role.ADMIN
            }
        })

        admins && admins.forEach(user => {
            emailTransporter.sendMail({
                from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
                to: user.email,
                subject: "Нян-фест 2023. Зарос на возврат билетов. Номер заказа: " + order?.id, // Subject line
                html: `<p>Зарос на возврат билетов. Номер заказа: </p><p><b><a href="${process.env.NEXTAUTH_URL}/dashboard/orders/${order?.id}">${order?.id}</a></b></p>`
              })
        })

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
