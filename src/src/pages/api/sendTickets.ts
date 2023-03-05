import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { z } from "zod"
import contentDisposition from "content-disposition"
import generateTicket from "@/lib/generateTicket"
import { Buffer } from "buffer"
import { emailTransporter } from "@/mail"

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
                        row: true,
                    },
                    orderBy: [
                        { row: { number: "asc"} },
                        { sortNumber: "asc" }
                    ]
                },
                user: true
            }
        })

        if (session?.user.role !== "admin" && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (order !== null) {
            const pdf = Buffer.from(await generateTicket(order))
            await emailTransporter.sendMail({
                from: `"Tanibata" <${process.env.MAIL_USER}>`,
                to: order.user.email,
                subject: "Танибата. Ваши билеты.", // Subject line
                html: `<p>Спасибо за покупку, увидимся на фестивале!</p>`,
                attachments: [{   // define custom content type for the attachment
                    filename: "tanibata-tickets-" + order?.id + ".pdf",
                    content: pdf,
                    contentType: "application/pdf"
                }],
            })
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