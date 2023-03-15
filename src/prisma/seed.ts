import { Prisma, PrismaClient, Role, Ticket, Venue } from '@prisma/client'
import bcrypt from 'bcryptjs'
import getHall, { HallTicketRow } from './hall'

const prisma = new PrismaClient()

// const getShowTickets = (venue: Venue, rows: Array<any>) => {
//     const tickets: Prisma.Enumerable<Prisma.TicketCreateManyInput> = []
    
//     for (let i = 0; i <= rows.length - 1; i++) {
//         for (let j = 1; j <= rows[i].ticketCount; j++) {
//             const ticket: any = {
//                 number: String(j),
//                 sortNumber: j,
//                 rowNumber: String(rows[i].number),
//                 sortRowNumber: i,
//                 venueId: venue.id
//             }

//             if (rows[i].reserved)
//                 ticket.reserved = true

//             if (rows[i].priceRange)
//                 ticket.priceRangeId = rows[i].priceRange.id
                   

//             tickets.push(ticket)
//         }
//     }
//     return tickets

// }

const getShowTickets = (venue: Venue, rows: HallTicketRow[]) => {
    const tickets: Prisma.Enumerable<Prisma.TicketCreateManyInput> = []
    
    for (let row of rows) {
        for (let ticket of row.tickets) {
            const t: any = {
                venueId: venue.id,
                rowNumber: String(row.number),
                sortRowNumber: row.number,
                number: String(ticket.number),
                sortNumber: ticket.number,
            }
            if (ticket.priceRange) {
                t.reserved = false
                t.priceRangeId = ticket.priceRange.id
            } else {
                t.reserved = true
            }
            tickets.push(t)
        }
    } 
    return tickets

}

async function main() {
    console.log("Creating users")

    await prisma.user.create({
        data: {
            email: "gworlds@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "everilion@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "g-worlds@ya.ru",
            name: "Константиновский Константин Константинович",
            nickname: "tester",
            age: 99,
            role: Role.CUSTOMER
        }
    })

    console.log("Creating venues")

    const venueShow = await prisma.venue.create({
        data: {
            name: "Нян-Фест, Косплей-шоу",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание косплей-шоу ...",
            start: new Date("2023-03-25 13:00"),
            active: true,
            ticketCount: 676,
            availableTickets: 676
        }
    })

    const venueConcert = await prisma.venue.create({
        data: {
            name: "Нян-фест, Концерт",
            address: "г. Ростов-на-Дону, пл. К. Маркса, 5/1",
            description: "Описание концерта ...",
            start: new Date("2023-03-25 18:00"),
            active: true,
            ticketCount: 600,
            availableTickets: 600,
            noSeats: true
        }
    })

    console.log("Creating price ranges")

    const showPriceZone1 = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 900,
            color: "#eaaa52",
            venueId: venueShow.id
        }
    })

    const showPriceZone2 = await prisma.priceRange.create({
        data: {
            name: "VIP",
            price: 1300,
            color: "#97d1c5",
            venueId: venueShow.id
        }
    })

    const concertPriceZone = await prisma.priceRange.create({
        data: {
            name: "Стандарт",
            price: 300,
            venueId: venueConcert.id
        }
    })

    console.log("Creating tickets")

    await prisma.ticket.createMany({
        data: getShowTickets(venueShow, getHall([showPriceZone1, showPriceZone2]))
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