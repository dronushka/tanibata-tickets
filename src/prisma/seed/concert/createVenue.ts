import { prisma } from "../../../src/lib/db"
import fs from "fs"

export default async function createVenue () {
    let mailMessage = '\
        <p><strong>Как пройти на концерт?</strong></p>\
        <p>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 15 июля 2023 г, 21:00.<br>\
        Билет даёт пропуск на концерт фестиваля.</p>\
        <p>Вход для зрителей будет открыт с 20:00.</p>\
        <p>21:00 - начало концерта</p>\
        <p><strong>Информация о фестивале:</strong> <a href="https://vk.com/tanibata" rel="nofollow">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></p>\
        <p><strong>Необходимо предъявить QR-код</strong> из этого электронного билета при входе на территорию проведения Концерта Танибаты-2023. На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов. Браслет будет Вашим пропуском на период Концерта.</p>\
        <p>Также Вы получите сувенирный бумажный билет на Концерт. Если Вы оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду.</p>\
        <p>Билеты на танибатаходики будут в продаже до самого отплытия - разумеется, <em>при их наличии</em>.</p>\
        <p><strong>В связи с требованиями противотеррористической безопасности мы настоятельно рекомендуем брать с собой оригинал удостоверения личности!</strong></p>\
    '

    const premiumTicketMessage = mailMessage + '\
        <p>Благодарим Вас за дополнительную поддержку фестиваля — приобретение билета Добро! В момент получения браслета и сувенирного билета вам будет вручён набор эксклюзивных сувениров, который отличается для каждого вида билета Добро.</p> \
    '

    const ticketTemplatePDF = "concert.pdf"
    const premiumTicketTemplatePDF = "concert.pdf"

    fs.copyFileSync(`prisma/seed/concert/${ticketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${ticketTemplatePDF}`)
    fs.copyFileSync(`prisma/seed/concert/${premiumTicketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${premiumTicketTemplatePDF}`)

    const ticketTemplate = await prisma.ticketTemplate.create({
        data: {
            mailMessage,
            premiumTicketMessage,
            ticketTemplate: ticketTemplatePDF,
            premiumTicketTemplate: premiumTicketTemplatePDF
        }
    })

    const venue = await prisma.venue.create({
        data: {
            name: "«Танибата», Концерт",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 200,
            availableTickets: 200,
            noSeats: true,
            ticketTemplateId: ticketTemplate.id
        }
    })

    const venuePriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 350,
            venueId: venue.id
        }
    })

    return venue
}