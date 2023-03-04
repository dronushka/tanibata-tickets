import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z, ZodError } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { OrderStatus } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()
        
    const validator = z.object({
        id: z.number(),
        status: z.nativeEnum(OrderStatus)
    })

    try {
        const validated = validator.parse({
            id: Number(req.body.orderId),
            status: req.body.status
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.id
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
                status: validated.status
            }
        })

        res.status(200).end()
    } catch (e: any) {
        console.error(e)
        let message: any = ""
        if (e instanceof ZodError)
            message = e.flatten().formErrors.join(", ")
        else if (e instanceof Error)
            message = e.message
        res.status(422).json({
            error: message
        })
    } 
}
