import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z, ZodError } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { OrderStatus } from '@prisma/client'
import { emailTransporter } from '@/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    const validator = z.object({
        id: z.number(),
        status: z.nativeEnum(OrderStatus)
    })

    try {
        const validated = validator.parse({
            id: Number(req.body.orderId),
            status: req.body.status
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.id
            }
        })

        if (session?.user.role !== "admin" && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        await prisma.order.update({
            where: {
                id: order?.id,
            },
            data: {
                status: validated.status
            }
        })

        if (validated.status === OrderStatus.RETURNED) {
            const user = await prisma.user.findUnique({
                where: { id: order?.userId}
            })
            
            emailTransporter.sendMail({
                from: `"Tanibata" <${process.env.MAIL_USER}>`,
                to: user?.email,
                subject: "Танибата. Возврат билетов. Номер заказа: " + order?.id, // Subject line
                html: `<p>Зарос на возврат билетов принят. Деньги вернутся на использованную при покупки карту в ближайшее время.</p>`
            })
        }


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
