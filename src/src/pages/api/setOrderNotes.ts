import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { Role } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (session?.user.role !== Role.ADMIN) {
        res.status(401).json({ error: "unauthorized" })
        return
    }

    const validator = z.object({
        id: z.number(),
        notes: z.string().max(1000)
    })

    try {
        const { id, notes } = validator.parse(req.body)

        await prisma.order.update({ where: { id }, data: { notes }})
        
        res.status(200).end()
    } catch (e: any) {
        res.status(500).json({
            error: e
        })
    }
}