import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()
        
    const validator = z.number()

    try {
        const validatedId = validator.parse(Number(req.body.orderId))

        const order = await prisma.order.findUnique({
            where: {
                id: validatedId
            }
        })

        if (session?.user.role !== "admin" && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        await prisma.order.update({
            where: {
                id: order?.id,
            },
            data: {
                status: req.body.status
            }
        })

        res.status(200).end()
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}
