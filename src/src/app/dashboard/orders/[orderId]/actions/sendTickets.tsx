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
import generateTicketPDF from "@/lib/generateTicketPDF"
import { PaymentData } from "@/app/orders/make/[venueId]/hooks/useOrder"
import { getQRString } from "@/lib/OrderQR"

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
                venue: {
                    include: {
                        ticketTemplate: true
                    }
                },
                tickets: {
                    orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "asc" }],
                },
                user: true,
            },
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) throw new Error("unauthorized")

        if (!order) throw new Error("order_not_found")
        if (!order.venue) throw new Error("order_venue_not_found")

        let ticketTemplate = "default_ticket_template.pdf"

        if (order.isGoodness && order.venue.ticketTemplate?.premiumTicketTemplate)
            ticketTemplate = order.venue.ticketTemplate?.premiumTicketTemplate
        else if (!order.isGoodness && order.venue.ticketTemplate?.ticketTemplate)
            ticketTemplate = order.venue.ticketTemplate?.ticketTemplate

        let ticketLines = []
        if (order.venue.noSeats)
            ticketLines = [`Количество билетов: ${order.ticketCount}`]
        else
            ticketLines = order.tickets.map((ticket, index) => `${index + 1}. Ряд: ${ticket.rowNumber}, место ${ticket.number}`)

        const pdf = Buffer.from(
            await generateTicketPDF(
                ticketTemplate,
                order.id,
                (order.paymentData as PaymentData).name,
                ticketLines,
                getQRString(order, order.user)
            )
        )

        // const pdf = Buffer.from(await generateTicket(order))

        // let description = '\
        //     <p>\
        //         <b>Как пройти на фестиваль?</b>\
        //     </p>\
        //     <p> \
        //         Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 15-16 июля 2023 г. \
        //         <br /> \
        //         Билет даёт пропуск на один день фестиваля (это билет на первый день - 15 июля). \
        //     </p> \
        //     <p>Вход для зрителей будет открыт с 9:30.</p> \
        //     <p>10:00 - ярмарка, мастер-классы и лекции.</p> \
        //     <p>13:00 - начало косплей-шоу.</p> \
        //     <p>\
        //         Информация о фестивале:&nbsp;\
        //         <a href="https://vk.com/tanibata" target="_blank" rel="noreferrer">\
        //             Танибата, Нян-фест и Алоха — фестивали в Ростове\
        //         </a>\
        //     </p>\
        //     <p>\
        //         Необходимо предъявить QR-код из этого электронного билета при входе на территорию проведения Танибаты-2023. \
        //         На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов. \
        //         Браслет будет Вашим пропуском на фестиваль в течение всего дня.\
        //     </p>\
        //     <p>\
        //         Также Вы получите сувенирный бумажный билет на Косплей-шоу с указанием ряда и номера места в зале. Если Вы \
        //         оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду. \
        //     </p>\
        //     <p>\
        //         Если вы захотите остаться после программы косплей-шоу 1-го дня фестиваля на концерт, билеты на него можно \
        //         будет приобрести в ОДНТ до начала концерта в 21:00. \
        //     </p>\
        //     <p>Билеты на танибатаходики будут в продаже до самого отплытия - разумеется, при их наличии.</p>\
        //     <p>\
        //         <b>\
        //             В связи с требованиями противотерристической безопасности мы настоятельно рекомендуем брать с собой \
        //             оригинал удостоверения личности! \
        //         </b>\
        //     </p>\
        // '
        // let description = ""
        // if (order.venue?.noSeats)
        //     description =
        //         '\
        //         <ul>\
        //             <li>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</li>\
        //             <li>Вход для зрителей будет открыт с 9:30 25 марта 2023 г.</li>\
        //             <li>21:00 - начало Концерта</li>\
        //             <li>\
        //                 Информация о фестивале:{" "}\
        //                 <a href="https://vk.com/tanibata" target="_blank" rel="noreferrer">\
        //                     Танибата, Нян-фест и Алоха — фестивали в Ростове\
        //                 </a>\
        //             </li>\
        //         </ul>\
        //     '
        
        let mailMessage = ""
        if (order.isGoodness && order.venue.ticketTemplate?.premiumTicketMessage)
            mailMessage = order.venue.ticketTemplate.premiumTicketMessage
        else if (!order.isGoodness && order.venue.ticketTemplate?.mailMessage)
            mailMessage = order.venue.ticketTemplate.mailMessage

        await sendTicketsMail(order.user.email, order.id, pdf, mailMessage)

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
