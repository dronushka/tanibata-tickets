import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"
import { z, ZodError } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { OrderStatus, Role } from '@prisma/client'
import { emailTransporter } from '@/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    const validator = z.object({
        id: z.number(),
        status: z.nativeEnum(OrderStatus)
    })

    try {
        const validated = validator.parse({
            id: Number(req.body.orderId),
            status: req.body.status
        })

        const order = await prisma.order.findUnique({
            where: {
                id: validated.id
            },
            include: {
                venue: true
            }
        })

        if ((validated.status === OrderStatus.USED || validated.status === OrderStatus.RETURNED)
            && session?.user.role !== Role.ADMIN) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (!order) {
            res.status(422).json({ error: "order_not_found" })
            return
        }

        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED) {
            res.status(422).json({ error: "cancelled_or_returned_cannot_be_changed" })
            return
        }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: validated.status
            }
        })

        if (
            order.venue?.noSeats
            && (validated.status === OrderStatus.CANCELLED || validated.status === OrderStatus.RETURNED)
        ) {
            await prisma.venue.update({
                where: { id: order.venue.id },
                data: { availableTickets: Math.min(order.venue.availableTickets + order.ticketCount, order.venue.ticketCount) }
            })
        }

        if (validated.status === OrderStatus.RETURNED) {
            const user = await prisma.user.findUnique({
                where: { id: order.userId }
            })

            emailTransporter.sendMail({
                from: `"Tanibata" <${process.env.MAIL_USER}>`,
                to: user?.email,
                subject: "Нян-Фест 2023 | Возврат билетов | Номер заказа: " + order?.id, // Subject line
                html: `
                    <p>Уважаемый зритель!</p>
                    <p>Сожалеем, что досадные обстоятельства помешали Вашему посещению Нян-Феста 2023.</p>
                    <p>
                        Теперь хорошие новости: отмена Вашего заказа билетов успешно произведена. 
                        Стоимость билетов будет возвращена Вам на банковскую карту, с которой производилась оплата, 
                        в течение 3 рабочих дней от даты отмены заказа.
                    </p>
                    <p>Будем рады видеть Вас на наших других мероприятиях! :)</p>
                    <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
                    <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
                    <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
                    <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
                    <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
                `
            })
        }


        res.status(200).end()
    } catch (e: any) {
        console.error(e)
        let message: any = ""
        if (e instanceof ZodError)
            message = e.flatten().formErrors.join(", ")
        else if (e instanceof Error)
            message = e.message
        res.status(422).json({
            error: message
        })
    }
}
