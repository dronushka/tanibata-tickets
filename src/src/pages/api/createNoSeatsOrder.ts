import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { z } from "zod"
import { OrderStatus, Prisma } from "@prisma/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    const validator = z.object({
        venueId: z.number(),
        paymentData: z.object({
            name: z.string().max(191),
            phone: z.string().max(18),
            email: z.string().max(100),
            age: z.string().max(2),
            nickname: z.string().max(191),
            social: z.string().max(191)
        }),
        ticketCount: z.number().min(1)
    })

    try {
        const { venueId, paymentData, ticketCount } = validator.parse(req.body)

        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: {
                priceRange: true
            }
        })

        if (!venue)
            throw new Error("venue_not_found")

        await prisma.user.update({
            where: {
                email: session?.user.email
            },
            data: {
                name: paymentData.name,
                phone: paymentData.phone,
                age: parseInt(paymentData.age),
                nickname: paymentData.nickname,
                social: paymentData.social,
            }
        })

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
                    venue: { connect: { id: venueId } },
                    user: { connect: { email: session?.user.email } }
                }
            })

            orderId = order.id
        })

        res.status(200).json({ orderId })

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

}