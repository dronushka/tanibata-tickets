import { NextApiRequest, NextApiResponse } from "next"
import formidable, { Fields, File, Files } from 'formidable'
import { ClientTicket } from "@/types/types"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"

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
    console.log('session', session)
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
            })

        console.log('createOrder', paymentData, tickets, cheque)

        //Check tickets
        const dbTickets = await prisma.ticket.findMany({
            where: {
                id: { in: tickets.map(ticket => ticket.id) }
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
                price += ticket.priceRange.price
            }
        }

        await prisma.user.update({
            where: {
                id: session?.user.id
            },
            data: {
                name: paymentData.name,
                phone: paymentData.phone,
                age: parseInt(paymentData.age),
                nickname: paymentData.nickname,
                social: paymentData.social,
            }
        })

        // tickets     Ticket[]
        // paymentData Json
        // price       Float
        // user        User     @relation(fields: [userId], references: [id])
        // userId      Int
        // const price = tickets.reduce((price, ticket)=>( price + ticket.priceRange.price), 0)

        await prisma.order.create({
            data: {
                paymentData,
                price,
                user: {
                    connect: {
                        id: session?.user.id
                    }
                },
                tickets: {
                    connect: tickets.map(ticket => ({ id: ticket.id }))
                }
            }
        })

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

    res.status(200).end()
}