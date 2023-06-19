"use server"

import { PaymentDataForm, ServerAction } from "@/types/types"
import renderActionResponse from "@/lib/renderActionResponse"
import renderActionErrors from "@/lib/renderActionErrors"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { generateRandomName } from "@/lib/helpers"
import fs from "fs"
import path from "path"
import { getServerSession } from "next-auth/next"
import { OrderStatus } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

type PaymentDataField = "orderId" | "goodness"

const payOrder: ServerAction = async (data: PaymentDataForm) => {
    const validator = z.object({
        orderId: z.number().gt(0, "invalid_order_id"),
        goodness: z.boolean(),
        comment: z.string().max(1000),
        cheque: z.custom<File>((val) => val instanceof File, "no_file"), //TODO validate mime and size
    })

    try {
        const session = await getServerSession(authOptions)

        const validated = validator.parse({
            orderId: Number(data.get("orderId")),
            goodness: Boolean(data.get("goodness")),
            comment: data.get("comment"),
            cheque: data.get("cheque"),
        })

        const order = await prisma.order.findUnique({
            where: { id: validated.orderId },
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

        // fs.copyFileSync(
        //     validated.cheque.filepath,
        //     path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", validated.cheque.newFilename)
        // )

        let orderStatus = order.status
        if (orderStatus === OrderStatus.UNPAID)
            orderStatus = OrderStatus.PENDING

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: orderStatus,
                isGoodness: validated.goodness,
                comment: validated.comment,
                price: validated.goodness
                    ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0) *
                      order.ticketCount
                    : order.price,
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

export default payOrder
