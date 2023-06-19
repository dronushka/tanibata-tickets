"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import renderActionResponse from "@/lib/renderActionResponse"
import renderActionErrors from "@/lib/renderActionErrors"
import { ServerAction } from "@/types/types"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { OrderStatus, PriceRange, Venue } from "@prisma/client"
import { User } from "next-auth"

const paymentDataValidator = z.object({
    name: z.string().max(191),
    phone: z.string().max(18),
    email: z.string().max(100),
    age: z.string().max(2),
    nickname: z.string().max(191),
    social: z.string().max(191),
})

const validator = z
    .object({
        venueId: z.number(),
        paymentData: paymentDataValidator,
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

const createOrderWithSeats = async (user: User, venueId: number, paymentData: z.infer<typeof paymentDataValidator>, tickets: number[]) => {
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

    let orderId = 0

    await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                paymentData,
                price,
                ticketCount,
                venue: { connect: { id: venueId } },
                user: { connect: { email: user.email } },
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

    if (orderId === 0)
        throw new Error("order_not_created")

    return orderId
}

const createOrderWithoutSeats = async (user: User, venue: Venue & { priceRange: PriceRange[]}, paymentData: z.infer<typeof paymentDataValidator>, ticketCount: number) => {
    const price = ticketCount * (venue.priceRange.length && venue.priceRange[0].price)

    let orderId = 0

    await prisma.$transaction(async (tx) => {
        const venues = await prisma.venue.updateMany({
            where: {
                id: venue.id,
                availableTickets: { gte: ticketCount }
            },
            data: {
                availableTickets: {
                    decrement: ticketCount
                }
            }
        })
        // console.log({ticketCount, reservedTicketCount, totalTicketCount: venue.ticketCount})
        if (venues.count !== 1)
            throw new Error("overbooking")

        const order = await tx.order.create({
            data: {
                paymentData,
                price,
                ticketCount,
                venue: { connect: { id: venue.id } },
                user: { connect: { email: user.email } }
            }
        })

        orderId = order.id
    })

    return orderId
}

const createOrder: ServerAction = async (data: z.infer<typeof validator>) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session) throw new Error("unathorized")

        const { venueId, paymentData, tickets, ticketCount } = validator.parse(data)

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

        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: {
                priceRange: true
            }
        })

        if (!venue) throw new Error("no_venue_specified")

        let orderId = 0

        if (!venue.noSeats && tickets) {
            // if (!tickets || !tickets.length)
            //     throw "no_tickets_specified"
            orderId = await createOrderWithSeats(session.user, venue.id, paymentData, tickets)
            
        } else if (venue.noSeats && ticketCount && ticketCount > 0) {
            orderId = await createOrderWithoutSeats(session.user, venue, paymentData, ticketCount)
        }

        if (orderId === 0)
            throw new Error("order_not_created")

        return renderActionResponse(orderId)
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default createOrder
