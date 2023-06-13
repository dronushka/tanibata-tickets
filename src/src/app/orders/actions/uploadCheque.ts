"use server"

import { z } from "zod"
import fs from "fs"
import path from "path"
import { generateRandomName } from "@/lib/helpers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/db"

export async function uploadCheque(data: FormData) {
    const session = await getServerSession(authOptions)
    console.log("session", session)
    if (!session)
        return
        
    const validator = z.object({
        orderId: z.number().gt(0, "invalid_order_id"),
        cheque: z.custom<File>(val => val instanceof File, "no_file") //TODO validate mime and size
    })

    const formData = {
        orderId: Number(data.get("orderId")),
        cheque: data.get("cheque")
    }

    const validated = validator.parse(formData)

    const order = await prisma.order.findUnique({
        where: { id: validated.orderId }
    })

    // if (!order) {
    //     res.status(422).json({ error: "order_not_found" })
    //     return
    // }

    // if (order.userId !== session?.user.id) {
    //     res.status(401).json({ error: "unauthorized" })
    // }


    const bytes = await validated.cheque.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const randomName = generateRandomName() + path.extname(validated.cheque.name)

    fs.writeFileSync(path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", randomName), buffer)

}
