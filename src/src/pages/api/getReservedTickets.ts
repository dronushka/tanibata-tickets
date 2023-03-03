import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"

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
                        orderId: {
                            gt: 0
                        }
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

        res.status(200).json({ tickets })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}