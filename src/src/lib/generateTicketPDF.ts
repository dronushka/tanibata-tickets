import { Template, generate, TextSchema } from "@pdfme/generator"
import fs from "fs"

export default async function generateTicketPDF(
    ticketTemplate: string,
    orderId: number,
    customerName: string,
    ticketLines: string[],
    QRString: string
) {
    const ticketsInputs: TextSchema[] = []
    const ticketValues: string[] = []

    ticketLines.forEach((ticketLine, key) => {
        ticketsInputs.push({
            type: "text",
            position: { x: 36.51, y: 163.66 + 10 * key },
            width: 200,
            height: 10,
            fontSize: 20,
        })
        ticketValues.push(ticketLine)
    })

    const buffer = fs.readFileSync((process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage") + "/" + ticketTemplate)
    
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
                ...ticketsInputs.reduce((fields, value, index) => {
                    return {...fields, [String(index)]: value}
                }, {}),
            },
        ],
    }

    const inputs = [
        {
            orderNum: "Заказ №" + String(orderId),
            name: customerName,
            qrcode: QRString,
            // qrcode: getQRString(order, order.user),
            ...ticketValues.reduce((fields, value, index) => {
                return {...fields, [String(index)]: value}
            }, {})
        },
    ]

    return generate({ template, inputs })
}
