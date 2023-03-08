import DashboardHall from "@/components/dashboard/DashboardHall"
import DashboardLoader from "@/components/dashboard/DashboardLoader"
import DashboardHallNoSeats from "@/components/dashboard/DashboardHallNoSeats"
import { TicketRow } from "@/components/MakeOrder/useOrder"
import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { OrderStatus, Role } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== Role.ADMIN)
        redirect('/dashboard/login')

    const venues = await prisma.venue.findMany({
        where: {
            active: true
        },
        include: {
            tickets: {
                include: {
                    priceRange: true,
                    order: true
                },
                orderBy: [
                    { sortRowNumber: "asc" },
                    { sortNumber: "desc" }
                ]
            }
        }
    })

    // const total = await prisma.ticket.count({
    //     where: { venueId: venue.id }
    // })

    // const reserved = await prisma.ticket.count({
    //     where: {
    //         AND: [
    //             { venueId: venue.id },
    //             { orderId: { gt: 0 } },
    //             {
    //                 order: {
    //                     AND: [
    //                         { NOT: { status: OrderStatus.CANCELLED } },
    //                         { NOT: { status: OrderStatus.RETURNED } }
    //                     ]
    //                 }
    //             },
    //             { reserved: true }
    //         ]
    //     }
    // })


    if (!venues)
        return <DashboardLoader />


    return (
        <>
            {venues.map(venue => {


                if (venue.noPlaces) {
                    const reservedTickets = venue.tickets
                        .filter(ticket =>
                            ticket.reserved
                            || ticket.order && (ticket.order.status !== OrderStatus.CANCELLED && ticket.order.status !== OrderStatus.RETURNED)
                        )
                        // .map(ticket => ticket.id)
                    const totalTickets = venue.tickets.length
                    return <DashboardHallNoSeats
                        key={venue.id}
                        name={venue.name}
                        start={venue.start.toLocaleString('ru-RU')}
                        reserved={reservedTickets.length}
                        total={totalTickets}
                    />
                } else {
                    const ticketRowMap = new Map<string, TicketRow>()

                    if (venue.tickets)
                        for (let ticket of venue.tickets) {
                            const rowNumber = ticket.rowNumber ?? "default"

                            if (!ticketRowMap.has(rowNumber))
                                ticketRowMap.set(rowNumber, { number: rowNumber, tickets: [] })

                            ticketRowMap.get(rowNumber)?.tickets.push({
                                ...ticket,
                                order: ticket.order && {
                                    ...ticket.order,
                                    createdAt: ticket.order.createdAt.toLocaleString('ru-RU')
                                }
                            })
                        }

                    const { tickets: prismaTickets, ...restVenue } = venue
                    const clientVenue = {
                        ...restVenue,
                        start: restVenue.start.toLocaleString('ru-RU'),
                        rows: [...ticketRowMap.values()],
                        reservedTickets: prismaTickets
                            .filter(ticket =>
                                ticket.reserved
                                || ticket.order && (ticket.order.status !== OrderStatus.CANCELLED && ticket.order.status !== OrderStatus.RETURNED)
                            )
                            .map(ticket => ticket.id)
                    }

                    return <DashboardHall
                        key={venue.id}
                        venue={clientVenue}
                    />
                }
            })}
        </>
    )
    return
    return <p>Schema goes here</p>
}