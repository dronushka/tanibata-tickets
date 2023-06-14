"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { ServerMutation } from "@/types/types"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { OrderStatus, Role } from "@prisma/client"
import { sendRefundRequested } from '@/lib/mail'
import renderErrors from "@/lib/renderErrors"

const requestReturn: ServerMutation = async (data: FormData) => {
    const validator = z.object({
        orderId: z.number(),
    })

    try {
        const session = await getServerSession(authOptions)
        if (!session) return { error: "unathorized" }
        
        const validated = validator.parse({
            orderId: Number(data.get("orderId"))
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.orderId
            }
        })

        if (!order)
            throw new Error("order_not_found")

        if (order.userId !== session?.user.id)
            throw new Error("unauthorized")

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: OrderStatus.RETURN_REQUESTED
            }
        })

        const admins = await prisma.user.findMany({
            where: {
                role: Role.ADMIN
            }
        })

        await Promise.allSettled(admins.map(admin => sendRefundRequested(admin.email, order.id)))

    } catch (e: any) {
        return renderErrors(e)
    }
}

export default requestReturn
