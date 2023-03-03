import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import User from "@/components/User"
import { z } from "zod"
import path from "path"
import fs from 'fs'
import contentDisposition from 'content-disposition'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()
    const validator = z.number()

    try {
        const validatedId = validator.parse(Number(req.query.fileId))

        const file = await prisma.file.findUnique({
            where: {
                id: validatedId
            },
            include: {
                order: true
            }
        })

        // console.log('1- ', session?.user.role !== "admin")
        // console.log('1- ', file?.order?.userId !== session?.user.id)
        console.log(file)
        if (session?.user.role !== "admin" && file?.order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (!file) {
            res.status(404).json({ error: "file_not_found" })
            return
        }

        const filePath = path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", file.path)
        console.log(filePath)
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: "file_not_found" })
            return
        }


        const buffer = fs.readFileSync(filePath)
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-disposition', contentDisposition(file.path))
        res.send(buffer)

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }

}