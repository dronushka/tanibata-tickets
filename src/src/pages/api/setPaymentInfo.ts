import { prisma } from "@/db"
import formidable, { Fields, File, Files } from "formidable"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { z, ZodError } from "zod"
import { authOptions } from "./auth/[...nextauth]"
import fs from "fs"
import path from "path"
import { OrderStatus } from "@prisma/client"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)
    // console.log('session', session)
    if (!session)
        res.status(401).end()

    try {
        const { orderId, goodness, comment, cheque } = await new Promise<
            {
                orderId: number,
                goodness: boolean,
                comment: string,
                cheque: any
            }
        >(
            function (resolve, reject) {
                const form = new formidable.IncomingForm({ keepExtensions: true })
                form.parse(req, function (err, fields: Fields, files: Files) {
                    if (err) return reject(err)

                    resolve({
                        orderId: parseInt(String(fields.orderId)),
                        goodness: fields.goodness === "1",
                        comment: fields.comment as string,
                        cheque: files.cheque
                    })
                })
            }
        )

        const validator = z.object({
            orderId: z.number().gt(0, "invalid_order_id"),
            goodness: z.boolean(),
            comment: z.string(),
            cheque: z.custom<File>(val => val instanceof File, "no_file") //TODO validate mime and size
        })

        const validated = validator.parse({
            orderId,
            goodness,
            comment,
            cheque
        })

        const order = await prisma.order.findUnique({
            where: { id: validated.orderId }
        })

        if (!order) {
            res.status(422).json({ error: "order_not_found" })
            return
        }

        if (order.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
        }

        fs.copyFileSync(
            validated.cheque.filepath,
            path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", validated.cheque.newFilename)
        )

        let orderStatus = order.status
        if (orderStatus === OrderStatus.UNPAID)
            orderStatus = OrderStatus.PENDING

        
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: orderStatus,
                isGoodness: goodness,
                comment,
                price: goodness ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0) * order.ticketCount : order.price,
                cheque: {
                    create: {
                        path: validated.cheque.newFilename
                    }
                }
            }
        })
        

        res.status(200).end()

    } catch (e: any) {
        console.error(e)
        let message: any = ""
        if (e instanceof ZodError) {
            message = e.flatten().formErrors.join(", ")
            res.status(422).json({ error: message })
            return
        }
        else if (e instanceof Error) {
            res.status(500).json({ error: e.message })
            return
        }
    }
}