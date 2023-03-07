import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { OrderStatus } from "@prisma/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    try {
        const session = await getServerSession(req, res, authOptions)

        if (!session)
            res.status(401).end()

        const tickets = await prisma.ticket.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            {
                                orderId: {
                                    gt: 0
                                }
                            },
                            {
                                order: {
                                    AND: [
                                        {
                                            NOT: {
                                                status: OrderStatus.CANCELLED
                                            }
                                        },
                                        {
                                            NOT: {
                                                status: OrderStatus.RETURNED
                                            }
                                        }
                                    ]
                                }

                            }
                        ],

                    },
                    {
                        reserved: true
                    }
                ],

            },
            include: {
                order: true
            }
        })

        res.status(200).json({
            tickets: tickets.map(ticket => ({
                ...ticket,
                order: ticket.order && {
                    ...ticket.order,
                    createdAt: ticket.order.createdAt.toLocaleString('ru-RU')
                }
            }))
        })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}