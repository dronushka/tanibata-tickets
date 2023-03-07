import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { z } from "zod"
import contentDisposition from "content-disposition"
import generateTicket from "@/lib/generateTicket"
import { Buffer } from "buffer"

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
                        venue: true
                    }
                },
                user: true
            }
        })

        if (session?.user.role !== "admin" && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        // if (order === null)

        // const buffer = fs.readFileSync(filePath)
        // const pdf = new TextDecoder().decode(await generateTicket())
        if (order !== null) {
            const pdf = Buffer.from(await generateTicket(order))

            // console.log(pdf)
            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Content-disposition', contentDisposition("tanibata-tickets-" + order?.id + ".pdf"))
            res.send(pdf)
        } else {
            res.status(422).json({ error: "order_not_found" })

        }
        // res.end()
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}