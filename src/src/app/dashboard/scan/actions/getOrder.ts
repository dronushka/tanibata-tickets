"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { Role } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getSecurityString } from "@/lib/OrderQR"

const getOrder: ServerAction = async (data: { id: number; hash: string }) => {
    const validator = z.object({
        id: z.number(),
        hash: z.string(),
    })

    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== Role.ADMIN) throw new Error("unathorized")

        const validated = validator.parse(data)

        const order = await prisma.order.findUnique({
            where: { id: validated.id },
            include: {
                user: true,
                venue: true,
                tickets: true,
            },
        })

        if (!order) throw new Error("order_not_found")

        if (bcrypt.compareSync(getSecurityString(order, order.user), validated.hash)) {
            return renderActionResponse({
                ...order,
                createdAt: order.createdAt.toLocaleString("ru-RU"),
                user: {
                    ...order.user,
                    createdAt: order.user.createdAt.toLocaleString("ru-RU"),
                },
                venue: {
                    ...order.venue,
                    start: order.venue?.start.toLocaleString("ru-RU"),
                },
            })
        } else {
            throw new Error("order_qr_signature_error")
        }
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default getOrder
