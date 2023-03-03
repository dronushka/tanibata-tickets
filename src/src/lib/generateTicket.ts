import { Template, BLANK_PDF, generate, Schema, TextSchema } from '@pdfme/generator'
import { Order, Row, Ticket, User } from '@prisma/client'
// import { Template, BLANK_PDF } from '@pdfme/ui'; <- Template types and BLANK_PDF can also be imported from @pdfme/ui.
// import QRCode from 'qrcode'

export default async function generateTicket(order: Order & { user: User, tickets: (Ticket & { row: Row })[] }) {
    // const qrCode = await QRCode.toDataURL("1")
    const tickets: Record<string, TextSchema> = {}
    const ticketValues: Record<string, string> = {}

    order.tickets.forEach((ticket, key) => {
        tickets[ticket.id] = {
            type: "text",
            position: { x: 15, y: 20 + 10 * (key + 1) },
            width: 100,
            height: 10
        }
        ticketValues[ticket.id] = `${key + 1}. Ряд: ${ticket.row.number}, место ${ticket.number}`
    })

    const template: Template = {
        basePdf: BLANK_PDF,
        schemas: [
            {
                // logo: {
                //     type: 'image',
                //     position: { x: 0, y: 0 },
                //     width: 10,
                //     height: 10,
                // },
                header: {
                    type: "text",
                    position: { x: 15, y: 15 },
                    width: 100,
                    height: 10
                },
                qrcode: {
                    type: "qrcode",
                    position: { x: 100, y: 15 },
                    width: 50,
                    height: 50
                },
                ...tickets
            },
        ]
    }

    const inputs = [{
        header: "Билеты на фестиваль:",
        qrcode: String(order.id),
        ...ticketValues
    }]

    return generate({ template, inputs })
}