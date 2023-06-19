"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionResponse from "@/lib/renderActionResponse"
import renderActionErrors from "@/lib/renderActionErrors"
import { z } from "zod"
import { OrderStatus } from "@prisma/client"
import { ServerAction } from "@/types/types"
import { prisma } from "@/lib/db"

export const cancelOrder: ServerAction = async (orderId: number) => {
    const orderIdValidator = z.number()

    try {
        const session = await getServerSession(authOptions)
        if (!session) throw new Error("unathorized")

        const validatedOrderId = orderIdValidator.parse(orderId)

        const order = await prisma.order.findUnique({
            where: {
                id: validatedOrderId,
            },
            include: {
                venue: true,
            },
        })

        if (!order) throw new Error( "order_not_found")

        if (order?.userId !== session?.user.id) throw new Error( "unauthorized")

        if (
            order.status === OrderStatus.CANCELLED ||
            order.status === OrderStatus.RETURNED
        )
            throw new Error( "cancelled_or_returned_cannot_be_changed")

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
        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default cancelOrder
