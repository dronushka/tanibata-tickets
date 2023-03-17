import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"

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
        tickets: z.array(z.number()).min(1)
    })

    try {
        const { venueId, paymentData, tickets } = validator.parse(req.body)

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

        const venueExists = await prisma.venue.count({ where: { id: venueId }})
        if (!venueExists)
            throw "no_venue_specified"
            
        // if (!tickets || !tickets.length)
        //     throw "no_tickets_specified"

        const dbTickets = await prisma.ticket.findMany({
            where: {
                id: { in: tickets }
            },
            include: {
                priceRange: true
            }
        })

        const price = dbTickets.reduce((sum, ticket) => sum += ticket.priceRange?.price ?? 0, 0)
        const ticketCount = dbTickets.length
        
        let orderId = 0

        await prisma.$transaction(async (tx) => {
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

            const updatedTickets = await tx.ticket.updateMany({
                where: {
                    AND: [
                        { id: { in: dbTickets.map(ticket => ticket.id) } },
                        {
                            OR: [
                                { orderId: null },
                                { order: { status: OrderStatus.CANCELLED } },
                                { order: { status: OrderStatus.RETURNED } },
                            ]
                        }

                    ]
                },

                data: {
                    orderId: order.id,
                }
            })

            if (updatedTickets.count !== tickets.length) {
                throw new Error("tickets_pending")
            }
        })

        res.status(200).json({ orderId })

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

}