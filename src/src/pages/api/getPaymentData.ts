import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        res.status(401).end()
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        res.status(200).json({
            name: user?.name ?? "",
            email: user?.email ?? "",
            age: user?.age ? String(user?.age) : "",
            phone: user?.phone ?? "",
            nickname: user?.nickname ?? "",
            social: user?.social ?? ""
        })

    } catch (e: any) {
        res.status(500).json({ error: e?.message })
    }
}