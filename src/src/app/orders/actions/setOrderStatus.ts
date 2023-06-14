"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import renderErrors from "@/lib/renderErrors"
import { ZodError, z } from "zod"
import { OrderStatus, Role } from "@prisma/client"
import { ServerMutation } from "@/types/types"
import { prisma } from "@/lib/db"
import { sendRefund } from '@/lib/mail'

export const setOrderStatus: ServerMutation = async (data: FormData) => {
    const validator = z.object({
        orderId: z.number(),
        status: z.nativeEnum(OrderStatus),
    })

    try {
        const session = await getServerSession(authOptions)
        if (!session) return { error: "unathorized" }

        const validated = validator.parse({
            orderId: Number(data.get("orderId")),
            status: data.get("status"),
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.orderId,
            },
            include: {
                venue: true,
            },
        })

        if (
            (validated.status === OrderStatus.USED ||
                validated.status === OrderStatus.RETURNED) &&
            session?.user.role !== Role.ADMIN
        )
            return { error: "unauthorized" }

        if (
            session?.user.role !== Role.ADMIN &&
            order?.userId !== session?.user.id
        )
            return { error: "unauthorized" }

        if (!order) return { error: "order_not_found" }

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
                status: validated.status,
            },
        })

        if (
            order.venue?.noSeats &&
            (validated.status === OrderStatus.CANCELLED ||
                validated.status === OrderStatus.RETURNED)
        ) {
            await prisma.venue.update({
                where: { id: order.venue.id },
                data: {
                    availableTickets: Math.min(
                        order.venue.availableTickets + order.ticketCount,
                        order.venue.ticketCount
                    ),
                },
            })
        }

        if (validated.status === OrderStatus.RETURNED) {
            const user = await prisma.user.findUnique({
                where: { id: order.userId },
            })

            user && (await sendRefund(user.email, order.id))
        }
    } catch (e: any) {
        return renderErrors(e)
    }
}

export default setOrderStatus
