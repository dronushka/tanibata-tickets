import { prisma } from "../../../src/lib/db"

export default async function createVenue () {
    const goodnessVenue = await prisma.venue.create({
        data: {
            name: "Подарить добро",
            address: "",
            description: "",
            start: new Date("2023-07-15 18:00"),
            active: true,
            ticketCount: 10000,
            availableTickets: 10000,
            noSeats: true
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 2000,
            venueId: goodnessVenue.id
        }
    })

    return goodnessVenue
}