import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z, ZodError } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { OrderStatus, Role } from '@prisma/client'
import { sendRefund } from '@/lib/mail'

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
            },
            include: {
                venue: true
            }
        })

        if ((validated.status === OrderStatus.USED || validated.status === OrderStatus.RETURNED)
            && session?.user.role !== Role.ADMIN) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (!order) {
            res.status(422).json({ error: "order_not_found" })
            return
        }

        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED) {
            res.status(422).json({ error: "cancelled_or_returned_cannot_be_changed" })
            return
        }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: validated.status
            }
        })

        if (
            order.venue?.noSeats
            && (validated.status === OrderStatus.CANCELLED || validated.status === OrderStatus.RETURNED)
        ) {
            await prisma.venue.update({
                where: { id: order.venue.id },
                data: { availableTickets: Math.min(order.venue.availableTickets + order.ticketCount, order.venue.ticketCount) }
            })
        }

        if (validated.status === OrderStatus.RETURNED) {
            const user = await prisma.user.findUnique({
                where: { id: order.userId }
            })

            user && await sendRefund(user.email, order.id)
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
