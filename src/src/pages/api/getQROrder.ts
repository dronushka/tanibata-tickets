import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/db"
import { z, ZodError } from "zod"
import { Role } from "@prisma/client"

import bcrypt from 'bcryptjs'
import { getSecurityString } from "@/lib/OrderQR"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (session?.user.role !== Role.ADMIN)
        res.status(401).end()

    const validator = z.object({
        id: z.number(),
        hash: z.string()
    })

    // console.log("body", req.body)
    try {
        const validated = validator.parse(req.body)
        const order = await prisma.order.findUnique({ 
            where: { id: validated.id }, 
            include: { 
                user: true,
                venue: true,
                tickets: true 
            },
         })

        if (!order)
            throw new Error("order_not_found")

        // const hash = getOrderHash(order, order.user)
        // const authString = String(order.id) + String(order.createdAt.getTime()) + String(order.user.id) + String(order.user.createdAt.getTime())
        if (bcrypt.compareSync(getSecurityString(order, order.user), validated.hash)) {
            res.status(200).json({
                ...order,
                createdAt: order.createdAt.toLocaleString('ru-RU'),
                user: {
                    ...order.user,
                    createdAt: order.user.createdAt.toLocaleString('ru-RU')
                },
                venue: {
                    ...order.venue,
                    start: order.venue?.start.toLocaleString('ru-RU')
                },
            })
            return
        } else {
            throw new Error("order_qr_signature_error")
        }
    } catch (e: any) {
        console.error(e)
        if (e instanceof SyntaxError)
            res.status(422).json({ error: "validation_fail" })
        else if (e instanceof ZodError)
            res.status(422).json({ error: "json_parse_error" })
        else 
            res.status(422).json({ error: e?.message })
    }
}