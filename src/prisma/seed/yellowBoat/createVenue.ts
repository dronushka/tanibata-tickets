import { prisma } from "../../../src/lib/db"
import fs from "fs"

export default async function createVenue () {
    let mailMessage = '\
        <p><strong>Как пройти на Жёлтый Танибатаход?</strong></p>\
        <p><strong>Место погрузки в автобусы:</strong> ОДНТ, пл. Карла Маркса, 5/1, 16 июля 2023 г, 18:40.<br>\
        <strong>Место отплытия:</strong> Набережная, 20:00. Номер причала можно узнать при обмене билета на бумажный оригинал (читай ниже)<br>\
        Билет даёт пропуск на Фестивальные Автобусы и <strong>Жёлтый Танибатаход</strong>.</p>\
        <p>Информация о фестивале: <a href="https://vk.com/tanibata" rel="nofollow">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></p>\
        <p><strong>Необходимо предъявить QR-код</strong> из этого электронного билета Билетёру фестиваля до начала погрузки в Автобусы. Вы получите сувенирный бумажный билет на Ходик. Если Вы оплатили в одной заявке несколько билетов, то получить все билеты можно по одному QR-коду.</p>\
        <p><strong>В связи с требованиями противотеррористической безопасности мы настоятельно рекомендуем брать с собой оригинал удостоверения личности!</strong></p>\
    '

    const premiumTicketMessage = mailMessage + '\
        <p>Благодарим Вас за дополнительную поддержку фестиваля — приобретение билета Добро! В момент получения браслета и сувенирного билета вам будет вручён набор эксклюзивных сувениров, который отличается для каждого вида билета Добро.</p> \
    '

    const ticketTemplatePDF = "yellowBoat.pdf"
    const premiumTicketTemplatePDF = "yellowBoatPremium.pdf"

    fs.copyFileSync(`prisma/seed/yellowBoat/${ticketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${ticketTemplatePDF}`)
    fs.copyFileSync(`prisma/seed/yellowBoat/${premiumTicketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${premiumTicketTemplatePDF}`)

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
            name: "Танибатаход Жёлтый",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "",
            start: new Date("2023-07-15 18:40"),
            active: true,
            goodnessPrice: 2000,
            ticketCount: 40,
            availableTickets: 40,
            noSeats: true,
            ticketTemplateId: ticketTemplate.id
        }
    })

    const venuePriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 1200,
            venueId: venue.id
        }
    })

    return venue
}