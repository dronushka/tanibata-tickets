import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { OrderStatus } from "@prisma/client"
import { ClientTicket } from "@/components/MakeOrder/TicketsPicker/TicketsPicker"
import formidable, { Fields, File, Files } from 'formidable'

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

        if (!tickets || !tickets.length)
            throw "no tickets specified"
        // console.log('createOrder', paymentData, tickets, cheque)

        const dbTickets = await prisma.ticket.findMany({
            where: {
                AND: [
                    {
                        id: { in: tickets.map(ticket => ticket.id) }
                    },
                    {
                        order: {
                            NOT: {
                                status: OrderStatus.CANCELLED
                            }
                        }
                    }
                ]
            },
            include: {
                priceRange: true,
                order: true
            }
        })

        let price = 0
        for (let ticket of dbTickets) {
            if (ticket.order) {
                res.status(422).json({ error: "some_tickets_are_bought" })
                return
            }
            else {
                price += ticket.priceRange?.price ?? 0
            }
        }

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

        const order = await prisma.order.create({
            data: {
                paymentData,
                price,
                user: {
                    connect: {
                        email: session?.user.email
                    }
                },
                tickets: {
                    connect: tickets.map(ticket => ({ id: ticket.id }))
                }
            }
        })

        res.status(200).json({ orderId: order.id })

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

}