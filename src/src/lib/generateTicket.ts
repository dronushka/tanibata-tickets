import { Template, BLANK_PDF, generate, TextSchema } from "@pdfme/generator"
import { Order, PriceRangeTemplate, Ticket, User, Venue } from "@prisma/client"
import { getQRString } from "./OrderQR"
import fs from "fs"
import { PaymentData } from "@/app/orders/make/[venueId]/hooks/useOrder"

export default async function generateTicket(
    order: Order & {
        venue: Venue | null
        user: User
        tickets: (Ticket & { priceRangeTemplate: PriceRangeTemplate | null; venue: Venue | null })[]
    }
) {
    const tickets: Record<string, TextSchema> = {}
    const ticketValues: Record<string, string> = {}

    if (order.venue?.noSeats) {
        tickets["0"] = {
            type: "text",
            position: { x: 36.51, y: 163.66 + 10 },
            width: 200,
            height: 10,
            fontSize: 20,
        }
        ticketValues["0"] = `Количество билетов: ${order.ticketCount}`
    } else
        order.tickets.forEach((ticket, key) => {
            tickets[ticket.id] = {
                type: "text",
                position: { x: 36.51, y: 163.66 + 10 * key },
                width: 200,
                height: 10,
                fontSize: 20,
            }
            ticketValues[ticket.id] = `${key + 1}. Ряд: ${ticket.rowNumber}, место ${ticket.number}`
        })

    // const buffer = fs.readFileSync(
    //     order.venue?.noSeats
    //         ? (process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage") + "/ticket_template_2.pdf"
    //         : (process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage") + "/ticket_template_1.pdf"
    // )

    const buffer = fs.readFileSync((process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage") + "/" + order.tickets[0].priceRangeTemplate)

    const template: Template = {
        basePdf: buffer,
        schemas: [
            {
                orderNum: {
                    type: "text",
                    position: { x: 36.51, y: 143.66 },
                    width: 200,
                    height: 10,
                    fontSize: 22,
                },
                name: {
                    type: "text",
                    position: { x: 36.51, y: 153.66 },
                    width: 200,
                    height: 10,
                    fontSize: 15,
                },
                qrcode: {
                    type: "qrcode",
                    position: { x: 72.6, y: 68.17 },
                    width: 63.04,
                    height: 62.51,
                },
                ...tickets,
            },
        ],
    }

    const inputs = [
        {
            orderNum: "Заказ №" + String(order.id),
            name: (order.paymentData as PaymentData).name,
            qrcode: getQRString(order, order.user),
            ...ticketValues,
        },
    ]

    return generate({ template, inputs })
}
