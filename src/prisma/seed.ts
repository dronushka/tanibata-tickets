import { Prisma, PrismaClient, Role, Venue } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const getShowTickets = (venue: Venue, rows: Array<any>) => {
    const tickets: Prisma.Enumerable<Prisma.TicketCreateManyInput> = []
    
    for (let i = 0; i <= rows.length - 1; i++) {
        for (let j = 1; j <= rows[i].ticketCount; j++) {
            const ticket: any = {
                number: String(j),
                sortNumber: j,
                rowNumber: String(rows[i].number),
                sortRowNumber: i,
                venueId: venue.id
            }

            if (rows[i].reserved)
                ticket.reserved = true

            if (rows[i].priceRange)
                ticket.priceRangeId = rows[i].priceRange.id
                   

            tickets.push(ticket)
        }
    }
    return tickets

}

// const getConcertTickets = (venue: Venue, count: number, priceRange: PriceRange) => {
//     const tickets: Prisma.Enumerable<Prisma.TicketCreateManyInput> = []
//     for (let i = 0; i < count - 1; i++) {
//         const ticket: any = {
//             number: String(i),
//             sortNumber: i,
//             venueId: venue.id,
//             priceRangeId: priceRange.id
//         }

//         tickets.push(ticket)
//     }

//     return tickets
// }

async function main() {
    console.log("Creating users")

    await prisma.user.create({
        data: {
            email: "gworlds@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN,
            passwords: {
                create: {
                    hash: bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD ?? "secret", 10)
                }
            }
        }
    })

    await prisma.user.create({
        data: {
            email: "everilion@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN,
            passwords: {
                create: {
                    hash: bcrypt.hashSync("secret", 10)
                }
            }
        }
    })

    console.log("Creating venues")

    const venueShow = await prisma.venue.create({
        data: {
            name: "Нянфест. Косплей-шоу.",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание косплей-шоу ...",
            start: new Date("2023-03-25 13:00"),
            active: true,
            ticketCount: 676
        }
    })

    const venueConcert = await prisma.venue.create({
        data: {
            name: "Нянфест. Концерт.",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-03-25 18:00"),
            active: true,
            ticketCount: 10,
            noSeats: true
        }
    })

    console.log("Creating price ranges")

    const showPriceZone1 = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 1000,
            venueId: venueShow.id
        }
    })

    const showPriceZone2 = await prisma.priceRange.create({
        data: {
            name: "VIP",
            price: 2000,
            venueId: venueShow.id
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 500,
            venueId: venueConcert.id
        }
    })

    console.log("Creating tickets")

    const rows = [
        { number: 1, priceRange: showPriceZone2, ticketCount: 21 },
        { number: 2, priceRange: showPriceZone2, ticketCount: 22 },
        { number: 3, priceRange: showPriceZone2, ticketCount: 23 },
        { number: 4, priceRange: showPriceZone2, ticketCount: 25 },
        { number: 5, priceRange: showPriceZone2, ticketCount: 26 },
        { number: 6, priceRange: showPriceZone2, ticketCount: 27 },
        { number: 7, priceRange: showPriceZone2, ticketCount: 28 },
        { number: 8, priceRange: showPriceZone2, ticketCount: 28 },
        { number: 9, priceRange: showPriceZone2, ticketCount: 28 },
        { number: 10, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 11, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 12, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 13, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 14, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 15, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 16, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 17, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 18, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 19, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 20, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 21, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 22, priceRange: showPriceZone1, ticketCount: 28 },
        { number: 23, reserved: true, ticketCount: 28 },
        { number: 24, reserved: true, ticketCount: 28 },
        { number: 25, reserved: true, ticketCount: 28 },
    ]

    await prisma.ticket.createMany({
        data: getShowTickets(venueShow, rows) || []
    })

    // await prisma.ticket.createMany({
    //     data: getConcertTickets(venueConcert, 600, concertPriceZone) || []
    // })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        // process.exit(1)
    })