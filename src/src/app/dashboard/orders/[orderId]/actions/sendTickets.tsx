"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { ServerAction } from "@/types/types"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import generateTicket from "@/lib/generateTicket"
import { sendTickets as sendTicketsMail } from "@/lib/mail"
import React, { ReactNode } from "react"

const sendTickets: ServerAction = async (orderId: number) => {
    const orderIdValidator = z.number()

    try {
        const session = await getServerSession(authOptions)
        if (!session) throw new Error("unathorized")

        const validatedOrderId = orderIdValidator.parse(orderId)

        const order = await prisma.order.findUnique({
            where: {
                id: validatedOrderId,
            },
            include: {
                venue: true,
                tickets: {
                    include: {
                        venue: true,
                    },
                    orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "asc" }],
                },
                user: true,
            },
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) throw new Error("unauthorized")

        if (!order) throw new Error("order_not_found")

        const pdf = Buffer.from(await generateTicket(order))

        let description: ReactNode = (
            <ul>
                <li>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</li>
                <li>Вход для зрителей будет открыт с 9:30 25 марта 2023 г.</li>
                <li>10:00 мастер-классы и лекции</li>
                <li>13:00 начало косплей-шоу</li>
                <li>
                    Информация о фестивале:{" "}
                    <a href="https://vk.com/tanibata" target="_blank" rel="noreferrer">
                        Танибата, Нян-фест и Алоха — фестивали в Ростове
                    </a>
                </li>
            </ul>
        )

        if (order.venue?.noSeats)
            description = (
                <ul>
                    <li>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</li>
                    <li>Вход для зрителей будет открыт с 9:30 25 марта 2023 г.</li>
                    <li>21:00 - начало Концерта</li>
                    <li>
                        Информация о фестивале:{" "}
                        <a href="https://vk.com/tanibata" target="_blank" rel="noreferrer">
                            Танибата, Нян-фест и Алоха — фестивали в Ростове
                        </a>
                    </li>
                </ul>
            )

        await sendTicketsMail(order.user.email, order.id, pdf, description)
        
        await prisma.sentTicket.create({
            data: {
                orderId: order.id,
            },
        })

        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default sendTickets
