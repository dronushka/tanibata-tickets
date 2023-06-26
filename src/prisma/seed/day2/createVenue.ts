import { prisma } from "../../../src/lib/db"
import getShowTickets from "../getShowTickets"
import getHall from "./hall"
import fs from "fs"

export default async function createVenue () {
    let mailMessage = '\
        <p>Спасибо за покупку! <strong>Ваш билет прикреплён к данному письму!</strong></p>\
        <p><strong>Как пройти на фестиваль?</strong></p>\
        <p><strong>Место проведения:</strong> ОДНТ, пл. Карла Маркса, 5/1, 15-16 июля 2023 г.<br>\
        Билет даёт пропуск на один день фестиваля <strong>(это билет на второй день - 16 июля)</strong>.</p>\
        <p>Вход для зрителей будет открыт с 9:30.</p>\
        <p>10:00 - ярмарка, мастер-классы и лекции.</p>\
        <p>13:00 - начало косплей-шоу.</p>\
        <p><strong>Информация о фестивале:</strong> <a href="https://vk.com/tanibata" rel="nofollow">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></p>\
        <p><strong>Необходимо предъявить QR-код</strong> из этого электронного билета при входе на территорию проведения Танибаты-2023. На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов. Браслет будет Вашим пропуском на фестиваль в течение всего дня.</p>\
        <p>Также Вы получите сувенирный бумажный билет на Косплей-шоу с указанием ряда и номера места в зале. Если Вы оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду.</p>\
        <p>Билеты на танибатаходики будут в продаже до самого отплытия - разумеется, <em>при их наличии</em>.</p>\
        <p><strong>В связи с требованиями противотеррористической безопасности мы настоятельно рекомендуем брать с собой оригинал удостоверения личности!</strong></p>\
    '

    const premiumTicketMessage = mailMessage + '\
        <p>Благодарим Вас за дополнительную поддержку фестиваля — приобретение билета Добро! В момент получения браслета и сувенирного билета вам будет вручён набор эксклюзивных сувениров, который отличается для каждого вида билета Добро.</p> \
    '
    const ticketTemplatePDF = "day2show.pdf"
    const premiumTicketTemplatePDF = "day2showPremium.pdf"

    fs.copyFileSync(`prisma/seed/day2/${ticketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${ticketTemplatePDF}`)
    fs.copyFileSync(`prisma/seed/day2/${premiumTicketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${premiumTicketTemplatePDF}`)

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
            name: "«Танибата», Косплей-шоу, День 2",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание косплей-шоу ...",
            start: new Date("2023-07-16 13:00"),
            active: true,
            goodnessPrice: 2200,
            ticketCount: 676,
            availableTickets: 676,
            ticketTemplateId: ticketTemplate.id
        }
    })

    const showPriceZone1 = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 1000,
            color: "#eaaa52",
            venueId: venue.id,
        }
    })

    const showPriceZone2 = await prisma.priceRange.create({
        data: {
            name: "VIP",
            price: 1500,
            color: "#97d1c5",
            venueId: venue.id,
        }
    })

    await prisma.ticket.createMany({
        data: getShowTickets(venue, getHall([showPriceZone1, showPriceZone2]))
    })
}