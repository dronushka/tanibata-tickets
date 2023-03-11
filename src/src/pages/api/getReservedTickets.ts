import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { z, ZodError } from "zod"
import { OrderStatus } from "@prisma/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        res.status(401).end()
        return
    }

    const venueIdValidator = z.string().regex(/^\d+$/)

    try {
        const venueId = Number(venueIdValidator.parse(req.query.venueId))

        const venue = await prisma.venue.findUnique({ where: { id: venueId } })

        if (!venue)
            throw "venue_not_found"

        if (venue.noSeats) {
            const reservedTicketCount = (await prisma.order.aggregate({
                where: {
                    AND: [
                        { venueId: venue.id },
                        { NOT: { status: OrderStatus.CANCELLED } },
                        { NOT: { status: OrderStatus.RETURNED } }
                    ],

                },
                _sum: {
                    ticketCount: true
                }
            }))._sum.ticketCount ?? 0

            res.status(200).json({ reservedTicketCount })
        } else {
            const reservedTickets = await prisma.ticket.findMany({
                where: {
                    AND: [
                        {
                            order: { venueId: venue.id }
                        },
                        {
                            OR: [
                                {
                                    reserved: true
                                },
                                {
                                    order: {
                                        AND: [
                                            { NOT: { status: OrderStatus.CANCELLED } },
                                            { NOT: { status: OrderStatus.RETURNED } }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                },
                select: { id: true }
            })

            res.status(200).json(reservedTickets.map(ticket => ticket.id))
        }
    } catch (e: any) {
        if (typeof e === 'string')
            res.status(422).json({ error: e })
        else if (e instanceof ZodError)
            res.status(422).json({ error: e.flatten.toString() })
        else
            res.status(500).json({ error: e?.message })
    }
}