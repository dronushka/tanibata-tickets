import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { z } from "zod"
import contentDisposition from "content-disposition"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"
import generateTicketPDF from "@/lib/generateTicketPDF"
import { getQRString } from "@/lib/OrderQR"
import { PaymentData } from "@/app/orders/make/[venueId]/hooks/useOrder"

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
    const validator = z.number()

    try {
        const session = await getServerSession(authOptions)

        if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

        const validatedId = validator.parse(Number(params.ticketId))

        const order = await prisma.order.findUnique({
            where: {
                id: validatedId
            },
            include: {
                venue: {
                    include: {
                        ticketTemplate: true
                    }
                },
                tickets: {
                    include: {
                        venue: true
                    }
                },
                user: true
            }
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) 
            return NextResponse.json({ error: "unauthorized" }, { status: 401 })

        if (order !== null) {
            let ticketTemplate = "default_ticket_template.pdf"

            if (order.isGoodness && order.venue?.ticketTemplate?.premiumTicketTemplate)
                ticketTemplate = order.venue.ticketTemplate?.premiumTicketTemplate
            else if (!order.isGoodness && order.venue?.ticketTemplate?.ticketTemplate)
                ticketTemplate = order.venue.ticketTemplate?.ticketTemplate
    
            let ticketLines = []
            if (order.venue?.noSeats)
                ticketLines = [`Количество билетов: ${order.ticketCount}`]
            else
                ticketLines = order.tickets.map((ticket, index) => `${index + 1}. Ряд: ${ticket.rowNumber}, место ${ticket.number}`)

            const pdf = Buffer.from(await generateTicketPDF(
                ticketTemplate,
                order.id,
                (order.paymentData as PaymentData).name,
                ticketLines,
                getQRString(order, order.user)
            ))

            return new Response(pdf, {
                status: 200,
                headers: { 
                    "Content-Type": "application/octet-stream",
                    "Content-disposition": contentDisposition("tanibata-tickets-" + order?.id + ".pdf")
                },
              })
            // // console.log(pdf)
            // res.setHeader('Content-Type', 'application/octet-stream')
            // res.setHeader('Content-disposition', contentDisposition("tanibata-tickets-" + order?.id + ".pdf"))
            // res.send(pdf)
        } else
            return NextResponse.json({ error: "order_not_found" }, { status: 422 })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e?.message }, { status: 500 })
    }
}