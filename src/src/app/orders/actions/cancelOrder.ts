"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import renderErrors from "@/lib/renderErrors"
import { ZodError, z } from "zod"
import { OrderStatus, Role } from "@prisma/client"
import { ServerMutation } from "@/types/types"
import { prisma } from "@/lib/db"
import { sendRefund } from "@/lib/mail"

export const cancelOrder: ServerMutation = async (data: FormData) => {
    const validator = z.object({
        orderId: z.number(),
    })

    try {
        const session = await getServerSession(authOptions)
        if (!session) return { error: "unathorized" }

        const validated = validator.parse({
            orderId: Number(data.get("orderId")),
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.orderId,
            },
            include: {
                venue: true,
            },
        })

        if (!order) return { error: "order_not_found" }

        if (order?.userId !== session?.user.id) return { error: "unauthorized" }

        if (
            order.status === OrderStatus.CANCELLED ||
            order.status === OrderStatus.RETURNED
        )
            return {
                error: "cancelled_or_returned_cannot_be_changed",
            }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: OrderStatus.CANCELLED,
            },
        })

        if (order.venue?.noSeats)
            await prisma.venue.update({
                where: { id: order.venue.id },
                data: {
                    availableTickets: Math.min(
                        order.venue.availableTickets + order.ticketCount,
                        order.venue.ticketCount
                    ),
                },
            })

    } catch (e: any) {
        return renderErrors(e)
    }
}

export default cancelOrder
