"use server"

import { ZodError, z } from "zod"
import fs from "fs"
import path from "path"
import { generateRandomName } from "@/lib/helpers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/db"
import { OrderStatus } from "@prisma/client"
import renderActionResponse from "@/lib/renderActionResponse"
import renderActionErrors from "@/lib/renderActionErrors"
import { ServerMutation } from "@/types/types"

export const uploadCheque: ServerMutation = async (data: FormData) => {
    const session = await getServerSession(authOptions)

    if (!session) throw new Error("unauthorized")

    const validator = z.object({
        orderId: z.number().gt(0, "invalid_order_id"),
        cheque: z.custom<File>((val) => val instanceof File, "no_file"), //TODO validate mime and size
    })

    try {
        const formData = {
            orderId: Number(data.get("orderId")),
            cheque: data.get("cheque"),
        }

        const validated = validator.parse(formData)

        const order = await prisma.order.findUnique({
            where: { id: validated.orderId },
            include: { cheque: true },
        })

        if (!order) throw new Error("order_not_found")

        if (order.userId !== session?.user.id) throw new Error("unauthorized")

        const bytes = await validated.cheque.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const randomName =
            generateRandomName() + path.extname(validated.cheque.name)
        const filePath = path.join(
            process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage",
            randomName
        )
        fs.writeFileSync(filePath, buffer)

        //TODO delete old file from storage and database
        if (order.cheque?.path) {
            fs.unlinkSync(
                path.join(
                    process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage",
                    order.cheque.path
                )
            )
        }

        if (order?.cheque) {
            await prisma.file.delete({
                where: { id: order.cheque.id },
            })
        }

        let orderStatus = order.status
        if (orderStatus === OrderStatus.UNPAID)
            orderStatus = OrderStatus.PENDING

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: orderStatus,
                cheque: {
                    create: {
                        path: randomName,
                    },
                },
            },
        })

        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default uploadCheque
