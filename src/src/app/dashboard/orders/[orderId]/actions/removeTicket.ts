"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { Role } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db"

const removeTicket: ServerAction = async (ticketId: number) => {
    try {
        const session = await getServerSession(authOptions)

        if (session?.user.role !== Role.ADMIN) throw new Error("unauthorized")

        const validator = z.number()

        const validatedTicketId = validator.parse(ticketId)

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: validatedTicketId,
            },
            include: {
                order: true,
            },
        })

        if (!ticket) throw new Error("ticket_not_found")
        if (!ticket.order) throw new Error("ticket_not_assigned_to_order")

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: ticket.orderId ?? 0 },
                data: {
                    ticketCount: ticket?.order?.ticketCount ? Math.min(ticket.order.ticketCount - 1, 0) : 0,
                },
            })

            await tx.ticket.update({
                where: { id: ticket.id ?? 0 },
                data: {
                    orderId: null,
                },
            })

            const tickets = await tx.ticket.findMany({
                where: {
                    orderId: ticket.order?.id,
                },
                include: {
                    priceRange: true,
                },
            })

            const price = ticket.order?.isGoodness
                ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0) * tickets.length
                : tickets.reduce((sum, ticket) => (sum += ticket.priceRange?.price ?? 0), 0)

            await tx.order.update({
                where: {
                    id: ticket.order?.id,
                },
                data: {
                    price,
                    ticketCount: tickets.length,
                },
            })
        })

        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default removeTicket
