"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { Role } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db"

const setNoSeatTickets: ServerAction = async (data: { orderId: number; ticketCount: number }) => {
    try {
        const session = await getServerSession(authOptions)

        if (session?.user.role !== Role.ADMIN) throw new Error("unauthorized")

        const validator = z.object({
            orderId: z.number(),
            ticketCount: z.number().min(0)
        })

        const { orderId, ticketCount } = validator.parse(data)

        const order = await prisma.order.findFirst({
            where: { id: orderId },
            include: {
                venue: {
                    include: {
                        priceRange: true
                    }
                }
            }
        })

        if (!order) throw new Error("order_not_found")

        if ( ticketCount > (order.venue?.availableTickets ?? 0) + order.ticketCount )
            throw new Error("overbooking")


        const price = order.isGoodness
        ? ticketCount * Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0)
        : ticketCount * ((order.venue?.priceRange?.length && (order.venue.priceRange[0].price)) ?? 0)
        
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    price,
                    ticketCount
                }
            })

            await tx.venue.update({
                where: { id: order.venue?.id},
                data: {
                    availableTickets: (order.venue?.availableTickets ?? 0) + order.ticketCount - ticketCount
                }
            })
        })
            // console.log({ticketCount, reservedTicketCount, totalTicketCount: venue.ticketCount})
            // if (!venue)
            //     throw new Error("overbooking")
    
            // const order1 = await tx.order.create({
            //     data: {
            //         paymentData,
            //         price,
            //         ticketCount,
            //         venue: { connect: { id: venue.id } },
            //         user: { connect: { email: user.email } }
            //     }
            // })

        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default setNoSeatTickets
