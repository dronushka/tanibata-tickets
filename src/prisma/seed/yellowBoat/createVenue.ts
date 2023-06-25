import { prisma } from "../../../src/lib/db"

export default async function createVenue () {
    const yellowBoatVenue = await prisma.venue.create({
        data: {
            name: "«Танибата», Желтый Танибатаход",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 50,
            availableTickets: 50,
            noSeats: true
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 2000,
            venueId: yellowBoatVenue.id
        }
    })

    return yellowBoatVenue
}