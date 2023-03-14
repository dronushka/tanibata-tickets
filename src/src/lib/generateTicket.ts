import { Template, BLANK_PDF, generate, TextSchema } from '@pdfme/generator'
import { Order, Ticket, User, Venue } from '@prisma/client'
import { getQRString } from './OrderQR'
import fs from 'fs'

// import { Template, BLANK_PDF } from '@pdfme/ui'; <- Template types and BLANK_PDF can also be imported from @pdfme/ui.
// import QRCode from 'qrcode'

export default async function generateTicket(order: Order & { venue: Venue | null, user: User, tickets: (Ticket & {venue: Venue | null})[] }) {
    // const qrCode = await QRCode.toDataURL("1")
    const tickets: Record<string, TextSchema> = {}
    const ticketValues: Record<string, string> = {}

    order.tickets.forEach((ticket, key) => {
        tickets[ticket.id] = {
            type: "text",
            position: { x: 200, y: 40 + 15 * (key + 1) },
            width: 200,
            height: 15,
            fontSize: 30
        }
        ticketValues[ticket.id] = `${key + 1}. Ряд: ${ticket.rowNumber}, место ${ticket.number}`
    })

    const buffer = fs.readFileSync("/var/www/file_storage/ticket_template.pdf")

    const template: Template = {
        basePdf: buffer,
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
                    position: { x: 200, y: 40 },
                    width: 200,
                    height: 20,
                    fontSize: 30

                },
                qrcode: {
                    type: "qrcode",
                    position: { x: 440, y: 135 },
                    width: 95,
                    height: 95
                },
                ...tickets
            },
        ]
    }

    const inputs = [{
        header: order.venue?.name ?? "Нян-Фест 2023",
        qrcode: getQRString(order, order.user),
        ...ticketValues
    }]

    return generate({ template, inputs })
}