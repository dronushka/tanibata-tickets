"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { ServerMutation } from "@/types/types"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { OrderStatus, Role } from "@prisma/client"
import { sendRefundRequested } from '@/lib/mail'
import renderErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"

const requestReturn: ServerMutation = async (orderId: number) => {
    const orderIdValidator = z.number()

    try {
        const session = await getServerSession(authOptions)
        if (!session) throw new Error( "unauthorized")
        
        const validatedOrderId = orderIdValidator.parse(orderId)

        const order = await prisma.order.findUnique({
            where: {
                id: validatedOrderId
            }
        })

        if (!order)
            throw new Error( "order_not_found")

        if (order.userId !== session?.user.id)
            throw new Error( "unauthorized")

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

        return renderActionResponse()
    } catch (e: any) {
        return renderErrors(e)
    }
}

export default requestReturn
