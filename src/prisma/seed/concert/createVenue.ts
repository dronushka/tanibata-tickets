import { prisma } from "../../../src/lib/db"

export default async function createVenue () {
    const concert = await prisma.venue.create({
        data: {
            name: "«Танибата», Концерт",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 600,
            availableTickets: 600,
            noSeats: true
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 2000,
            venueId: concert.id
        }
    })

    return concert
}