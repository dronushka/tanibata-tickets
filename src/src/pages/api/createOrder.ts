import { NextApiRequest, NextApiResponse } from "next"
import formidable, { Fields, File, Files } from 'formidable'
import { ClientTicket } from "@/types/types"

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
    if (req.method != "POST")
        res.status(405).end()

    const form = new formidable.IncomingForm({ keepExtensions: true })
    const { paymentData, tickets, cheque } = await new Promise<{ paymentData: OrderData, tickets: ClientTicket[], cheque: File }>(
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
    // const form = new formidable.IncomingForm({ keepExtensions: true})

    console.log('createOrder', paymentData, tickets, cheque)
    res.status(200).end()
}