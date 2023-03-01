import { prisma } from "@/db"
import formidable, { Fields, File, Files } from "formidable"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { z, ZodError } from "zod"
import { authOptions } from "./auth/[...nextauth]"
import fs from "fs"
import path from "path"

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
        const { orderId, cheque } = await new Promise<
            {
                orderId: number,
                cheque: File
            }
        >(
            function (resolve, reject) {
                const form = new formidable.IncomingForm({ keepExtensions: true })
                form.parse(req, function (err, fields: Fields, files: Files) {
                    if (err) return reject(err)

                    resolve({
                        orderId: parseInt(String(fields.orderId)),
                        cheque: files.cheque as File
                    })
                })
            }
        )

        const validator = z.object({
            orderId: z.number().gt(0, "invalid_order_id"),
            cheque: z.custom<File>(val => val instanceof File, "no_file")
        })

        validator.parse({
            orderId,
            cheque
        })

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            res.status(422).json({ error: "order_not_found" })
            return
        }

        if (order.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
        }

        fs.copyFileSync(
            cheque.filepath,
            path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", cheque.newFilename)
        )

        await prisma.order.update({
            where: { id: order.id },
            data: {
                cheque: {
                    create: {
                        path: cheque.newFilename
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