import { prisma } from "../../../src/lib/db"

export default async function createVenue () {
    const blueBoatVenue = await prisma.venue.create({
        data: {
            name: "«Танибата», Синий Танибатаход",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 10,
            availableTickets: 10,
            noSeats: true
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 2000,
            venueId: blueBoatVenue.id
        }
    })

    return blueBoatVenue
}