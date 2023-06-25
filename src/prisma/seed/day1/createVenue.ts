import { prisma } from "../../../src/lib/db"
import getShowTickets from "../getShowTickets"
import getHall from "./hall"

export default async function createVenue () {
    const venue = await prisma.venue.create({
        data: {
            name: "«Танибата», Косплей-шоу, День 1",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание косплей-шоу ...",
            start: new Date("2023-07-15 13:00"),
            active: true,
            ticketCount: 676,
            availableTickets: 676
        }
    })

    const showPriceZone1 = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 900,
            color: "#eaaa52",
            venueId: venue.id
        }
    })

    const showPriceZone2 = await prisma.priceRange.create({
        data: {
            name: "VIP",
            price: 1300,
            color: "#97d1c5",
            venueId: venue.id
        }
    })

    await prisma.ticket.createMany({
        data: getShowTickets(venue, getHall([showPriceZone1, showPriceZone2]))
    })
}