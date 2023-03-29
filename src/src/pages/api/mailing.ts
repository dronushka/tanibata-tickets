import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/db"
import { emailTransporter } from "@/mail"
import { Role } from "@prisma/client"
import { PaymentData } from "@/components/MakeOrder/useOrder"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "GET")
            throw new Error("method_not_allowed")

        const session = await getServerSession(req, res, authOptions)

        if (session?.user.role !== Role.ADMIN) {
            throw new Error("unathorized")
        }

        const mailList = await prisma.sentTicket.findMany({
            where: {
                order: {
                    venueId: 2,
                }
            },
            select: {
                order: {
                    select: {
                        paymentData: true
                    }
                }
            }
        })

        const emails = [...new Set(mailList.map(item => (item.order.paymentData as PaymentData).email))]

        const html = `
            <p><b>Здравствуйте!</b></p>

            <p>Вы приобрели билет на концерт Нян-феста, который <b>начнется в 21:00</b> в Большом зале ОДНТ.</p>
            <p><b>К сожалению, Вы могли получить рассылку, где указано неверное время открытия доступа в ОДНТ для зрителей Концерта.</b></p>
            <p>
                Билет на Концерт дает возможность входа в ОДНТ в 20:00, за час до его начала: вы сможете без спешки зайти, 
                переодеться и посетить ярмарку и Концерт, который закончится в 23:30.
            </p>
            <br />
            <p>Таким образом, если вы не приобретали билет на Косплей-шоу, до 20:00 попасть в ОДНТ не будет возможности.</p>
            <br />
            <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
            <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
            <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
            <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
            <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
        `
        // const emails = ["g-worlds@ya.ru", "everilion@yandex.ru"]
        for (let email of emails) {
            console.log("Sending to " + email)
            // const result = await emailTransporter.sendMail({
            //     from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
            //     to: email,
            //     subject: "Нян-Фест 2023 | Информация об ошибке в тексте письма с билетом на Концерт.", // Subject line
            //     html,
            // })
            // const failed = result.rejected.concat(result.pending).filter(Boolean)
            // if (failed.length) {
            //     console.error(new Error(`Email(s) (${failed.join(", ")}) could not be sent`))
            // }

        }

        res.json(emails)

    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}