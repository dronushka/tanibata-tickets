import { prisma } from "../../../src/lib/db"
import fs from "fs"

export default async function createVenue () {
    let mailMessage = '\
        <p dir="auto">Благодарим Вас за поддержку фестиваля ( даже не имея возможности посетить его лично) — приобретение билета Добро! Вам будет отправлен набор эксклюзивных сувениров фестиваля. Отправка будет осуществлена по почте на адрес, указанный при оформлении билета.</p>\
    '

    const premiumTicketMessage = mailMessage + '\
        <p>Благодарим Вас за дополнительную поддержку фестиваля — приобретение билета Добро! В момент получения браслета и сувенирного билета вам будет вручён набор эксклюзивных сувениров, который отличается для каждого вида билета Добро.</p> \
    '

    const ticketTemplatePDF = "goodness.pdf"
    const premiumTicketTemplatePDF = "goodness.pdf"

    fs.copyFileSync(`prisma/seed/goodness/${ticketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${ticketTemplatePDF}`)
    fs.copyFileSync(`prisma/seed/goodness/${premiumTicketTemplatePDF}`, `${process.env.LOCAL_FILE_STORAGE}/${premiumTicketTemplatePDF}`)

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
            name: "Добро без посещения фестиваля",
            address: "",
            description: "",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 10000,
            availableTickets: 10000,
            noSeats: true,
            ticketTemplateId: ticketTemplate.id
        }
    })

    const venuePriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 2000,
            venueId: venue.id
        }
    })

    return venue
}