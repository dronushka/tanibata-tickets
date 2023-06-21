"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { OrderStatus, Role } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendRefund } from "@/lib/mail"

const setOrderStatus: ServerAction = async (data: { id: number; status: OrderStatus }) => {
    const validator = z.object({
        id: z.number(),
        status: z.nativeEnum(OrderStatus),
    })

    try {
        const session = await getServerSession(authOptions)

        const validated = validator.parse(data)

        if (
            (validated.status === OrderStatus.USED || validated.status === OrderStatus.RETURNED) &&
            session?.user.role !== Role.ADMIN
        )
            throw new Error("unauthorized")

        const order = await prisma.order.findUnique({
            where: {
                id: validated.id,
            },
            include: {
                venue: true,
            },
        })

        if (!order) 
            throw new Error("order_not_found")

        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED) {
            throw new Error("cancelled_or_returned_orders_cannot_be_changed")
        }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: validated.status,
            },
        })

        if (order.venue?.noSeats && (validated.status === OrderStatus.CANCELLED || validated.status === OrderStatus.RETURNED)) {
            await prisma.venue.update({
                where: { id: order.venue.id },
                data: { availableTickets: Math.min(order.venue.availableTickets + order.ticketCount, order.venue.ticketCount) },
            })
        }

        if (validated.status === OrderStatus.RETURNED) {
            const user = await prisma.user.findUnique({
                where: { id: order.userId },
            })

            user && (await sendRefund(user.email, order.id))
        }

        return renderActionResponse(validated.status)
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default setOrderStatus
