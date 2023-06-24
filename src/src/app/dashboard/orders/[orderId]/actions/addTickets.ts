"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { Role } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db"

const addTickets: ServerAction = async (data: {orderId: number, tickets: number[]}) => {
    console.log(data)
    try {
        const session = await getServerSession(authOptions)

        if (session?.user.role !== Role.ADMIN) throw new Error("unauthorized")

        const validator = z.object({
            orderId: z.number(),
            tickets: z.array(z.number()).min(1)
        })

        const { orderId, tickets } = validator.parse(data)

        const order = await prisma.order.findFirst({
            where: { id: orderId}
        })

        if (!order) throw new Error("order_not_found")

        const dbTickets = await prisma.ticket.findMany({
            where: {
                id: { in: tickets },
            },
            include: {
                priceRange: true,
            },
        })
    
        if (!dbTickets) throw new Error("tickets_not_found")

        const price = dbTickets.reduce(
            (sum, ticket) => (sum += ticket.priceRange?.price ?? 0),
            0
        )
        const ticketCount = dbTickets.length




        // if (!ticket) throw new Error("ticket_not_found")
        // if (!ticket.order) throw new Error("ticket_not_assigned_to_order")

        await prisma.$transaction(async (tx) => {
            // await tx.order.update({ 
            //     where: { id: order.id },
            //     data: {
            //         ticketCount: order.ticketCount + ticketCount,
            //         price: order.price + price
            //     }
            // })
            
            const updatedTickets = await tx.ticket.updateMany({
                where: {
                    id: {
                        in: dbTickets.map((ticket) => ticket.id)
                    }
                },
                data: {
                    orderId: order.id
                }
            })

            if (updatedTickets.count !== tickets?.length) {
                throw new Error("tickets_pending")
            }

            const orderTickets = await tx.ticket.findMany({
                where: {
                    orderId: order.id,
                },
                include: {
                    priceRange: true,
                },
            })

            await tx.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    price: orderTickets.reduce((sum, ticket) => (sum += ticket.priceRange?.price ?? 0), 0),
                    ticketCount: orderTickets.length
                },
            })
        })

        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default addTickets