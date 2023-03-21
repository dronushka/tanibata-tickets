import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { z } from "zod"
import generateTicket from "@/lib/generateTicket"
import { Buffer } from "buffer"
import { Role } from "@prisma/client"
import { sendTickets } from "@/lib/mail"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    const validator = z.number()

    try {
        const validatedId = validator.parse(Number(req.query.orderId))

        const order = await prisma.order.findUnique({
            where: {
                id: validatedId
            },
            include: {
                venue: true,
                tickets: {
                    include: {
                        venue: true,
                    },
                    orderBy: [
                        { sortRowNumber: "asc" },
                        { sortNumber: "asc" }
                    ]
                },
                user: true
            }
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (order !== null) {
            const pdf = Buffer.from(await generateTicket(order))
            
            await sendTickets(order.user.email, order.id, pdf)
            
            await prisma.sentTicket.create({
                data: {
                    orderId: order.id
                }
            })
            res.status(200).end()
        } else {
            res.status(422).json({ error: "order_not_found" })

        }
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}