import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session?.user.email
            },
            include: { role: true }
        })
        
        res.status(200).json(user)
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}