import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { z } from "zod"

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
                tickets: {
                    include: {
                        priceRange: true,
                        row: true,
                    }
                },
                cheque: true,
                user: true
            }
        })
        
        if (order?.user.id !== session?.user.id) {
            res.status(401).json({ error: "unauthorized"})
            return
        }

        res.status(200).json({ ...order, createdAt: order?.createdAt.toLocaleString('ru-RU') })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}