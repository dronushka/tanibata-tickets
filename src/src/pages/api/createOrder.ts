import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { OrderStatus } from "@prisma/client"
import { ClientTicket } from "@/components/MakeOrder/TicketsPicker/TicketsPicker"
import formidable, { Fields, File, Files } from 'formidable'
import { array } from "zod"
import { timeStamp } from "console"

export const config = {
    api: {
        bodyParser: false
    }
}

type OrderData = {
    name: string,
    phone: string,
    email: string,
    age: string,
    nickname: string,
    social: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)
    // console.log('session', session)
    if (!session)
        res.status(401).end()

    try {
        const { paymentData, tickets, cheque } = await new Promise<
            {
                paymentData: OrderData,
                tickets: ClientTicket[],
                cheque: File
            }
        >(
            function (resolve, reject) {
                const form = new formidable.IncomingForm({ keepExtensions: true })
                form.parse(req, function (err, fields: Fields, files: Files) {
                    if (err) return reject(err)
                    resolve({
                        paymentData: JSON.parse(fields.paymentInfo as string),
                        tickets: JSON.parse(fields.tickets as string),
                        cheque: files.cheque as File
                    })
                })
            }
        )

        await prisma.user.update({
            where: {
                email: session?.user.email
            },
            data: {
                name: paymentData.name,
                phone: paymentData.phone,
                age: parseInt(paymentData.age),
                nickname: paymentData.nickname,
                social: paymentData.social,
            }
        })

        if (!tickets || !tickets.length)
            throw "no_tickets_specified"

        const dbTickets = await prisma.ticket.findMany({
            where: {
                id: { in: tickets.map(ticket => ticket.id) }
            },
            include: {
                priceRange: true
            }
        })

        const price = dbTickets.reduce((sum, ticket) => sum += ticket.priceRange?.price ?? 0, 0)

        let orderId = 0


        await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    paymentData,
                    price,
                    user: {
                        connect: {
                            email: session?.user.email
                        }
                    }
                }
            })

            orderId = order.id

            const updatedTickets = await tx.ticket.updateMany({
                where: {
                    AND: [
                        { id: { in: dbTickets.map(ticket => ticket.id) } },
                        {
                            OR: [
                                { orderId: null },
                                { order: { status: OrderStatus.CANCELLED } },
                                { order: { status: OrderStatus.RETURNED } },
                            ]
                        }

                    ]
                },

                data: {
                    orderId: order.id,
                }
            })

            if (updatedTickets.count !== tickets.length) {
                throw new Error("tickets_pending")
            }
        })

        res.status(200).json({ orderId })

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

}