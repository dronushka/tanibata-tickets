import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/db"
import { z } from "zod"
import generateTicket from "@/lib/generateTicket"
import { Buffer } from "buffer"
import { Role } from "@prisma/client"
import { emailTransporter, sendTickets } from "@/lib/mail"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        res.status(405).end()

    const session = await getServerSession(req, res, authOptions)

    if (!session)
        res.status(401).end()

    const validator = z.number()

    try {
        const validatedId = validator.parse(Number(req.query.orderId))

        const order = await prisma.order.findUnique({
            where: {
                id: validatedId
            },
            include: {
                venue: true,
                tickets: {
                    include: {
                        venue: true,
                    },
                    orderBy: [
                        { sortRowNumber: "asc" },
                        { sortNumber: "asc" }
                    ]
                },
                user: true
            }
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) {
            res.status(401).json({ error: "unauthorized" })
            return
        }

        if (order !== null) {
            const pdf = Buffer.from(await generateTicket(order))
            let html = ''
            if (order.venue?.noSeats)
                html = `
                <p>Спасибо за покупку! <b>Ваш билет прикреплён к данному письму!</b></p>
                <p><b>Как пройти на фестиваль?</b></p>
                <p>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</p>
                <p>Вход для зрителей на Концерт будет открыт с 20:00, 25 марта 2023г .</p>
                <p>21:00 - начало Концерта</p>
                <p>Информация о фестивале: <a href="https://vk.com/tanibata" target="_blank">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></p>

                <p>
                    Необходимо предъявить QR-код из этого электронного билета при входе на территорию проведения Нян-феста 2023.
                    На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов. 
                    Браслет будет Вашим пропуском на Концерт в течение всего времени проведения.
                </p>
                <p>
                    Также Вы получите сувенирный бумажный билет на Концерт. 
                    Если Вы оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду.
                </p>
                <p>
                    <b>
                        В связи с требованиями противотерристической безопасности мы настоятельно рекомендуем брать 
                        с собой оригинал удостоверения личности!
                    </b>
                </p>
                <br />
                <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
                <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
                <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
                <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
                <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
                `
            else
                html = `
                <p>Спасибо за покупку! <b>Ваш билет прикреплён к данному письму!</b></p>
                <p><b>Как пройти на фестиваль?</b></p>
                <p>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</p>
                <p>Вход для зрителей будет открыт с 9:30 25 марта 2023 г.</p>
                <p>10:00 мастер-классы и лекции</p>
                <p>13:00 начало косплей-шоу</p>
                <p>Информация о фестивале: <a href="https://vk.com/tanibata" target="_blank">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></p>

                <p>
                    Необходимо предъявить QR-код из этого электронного билета при входе на территорию проведения Нян-феста 2023.
                    На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов. 
                    Браслет будет Вашим пропуском на фестиваль в течение всего дня.
                </p>
                <p>
                    Также Вы получите сувенирный бумажный билет на Косплей-шоу с указанием ряда и номера места в зале. 
                    Если Вы оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду.
                </p>
                <p>
                    Если вы захотите остаться после программы косплей-шоу Нян-феста 2023 на Концерт, билеты
                    на него можно будет приобрести в ОДНТ до начала концерта в 21:00.
                </p>
                <p>
                    <b>
                        В связи с требованиями противотерристической безопасности мы настоятельно рекомендуем брать 
                        с собой оригинал удостоверения личности!
                    </b>
                </p>
                <br />
                <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
                <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
                <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
                <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
                <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
                `
            await emailTransporter.sendMail({
                from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
                to: order.user.email,
                subject: "Нян-Фест 2023 | Билеты на фестиваль", // Subject line
                html,
                attachments: [{   // define custom content type for the attachment
                    filename: "tanibata-tickets-" + order?.id + ".pdf",
                    content: pdf,
                    contentType: "application/pdf"
                }],
            })
            await prisma.sentTicket.create({
                data: {
                    orderId: order.id
                }
            })
            res.status(200).end()
        } else {
            res.status(422).json({ error: "order_not_found" })

        }
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ error: e?.message })
    }
}