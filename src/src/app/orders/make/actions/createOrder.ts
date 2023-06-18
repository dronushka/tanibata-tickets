"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import renderActionResponse from "@/lib/renderActionResponse"
import renderActionErrors from "@/lib/renderActionErrors"
import { ServerAction } from "@/types/types"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { OrderStatus } from "@prisma/client"

const validator = z
    .object({
        venueId: z.number(),
        paymentData: z.object({
            name: z.string().max(191),
            phone: z.string().max(18),
            email: z.string().max(100),
            age: z.string().max(2),
            nickname: z.string().max(191),
            social: z.string().max(191),
        }),
        tickets: z.array(z.number()).min(1),
        ticketCount: z.number().min(1),
    })
    .partial({
        tickets: true,
        ticketCount: true,
    })
    .refine(
        ({ tickets, ticketCount }) =>
            tickets !== undefined || ticketCount !== undefined,
        { message: "no_tickets_provided" }
    )

const createOrder: ServerAction = async (data: z.infer<typeof validator>) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session) throw new Error("unathorized")

        const { venueId, paymentData, tickets } = validator.parse(data)

        await prisma.user.update({
            where: {
                email: session?.user.email,
            },
            data: {
                name: paymentData.name,
                phone: paymentData.phone,
                age: parseInt(paymentData.age),
                nickname: paymentData.nickname,
                social: paymentData.social,
            },
        })
        let orderId = 0

        const venue = await prisma.venue.findFirst({ where: { id: venueId } })
        if (!venue) throw new Error("no_venue_specified")
        if (!venue.noSeats) {
            // if (!tickets || !tickets.length)
            //     throw "no_tickets_specified"

            const dbTickets = await prisma.ticket.findMany({
                where: {
                    id: { in: tickets },
                },
                include: {
                    priceRange: true,
                },
            })

            const price = dbTickets.reduce(
                (sum, ticket) => (sum += ticket.priceRange?.price ?? 0),
                0
            )
            const ticketCount = dbTickets.length


            await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({
                    data: {
                        paymentData,
                        price,
                        ticketCount,
                        venue: { connect: { id: venueId } },
                        user: { connect: { email: session?.user.email } },
                    },
                })

                orderId = order.id

                const updatedTickets = await tx.ticket.updateMany({
                    where: {
                        AND: [
                            {
                                id: {
                                    in: dbTickets.map((ticket) => ticket.id),
                                },
                            },
                            {
                                OR: [
                                    { orderId: null },
                                    {
                                        order: {
                                            status: OrderStatus.CANCELLED,
                                        },
                                    },
                                    { order: { status: OrderStatus.RETURNED } },
                                ],
                            },
                        ],
                    },

                    data: {
                        orderId: order.id,
                    },
                })

                if (updatedTickets.count !== tickets?.length) {
                    throw new Error("tickets_pending")
                }
            })
        }
        return renderActionResponse(orderId)
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default createOrder
