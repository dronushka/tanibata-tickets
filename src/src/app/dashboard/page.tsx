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
            active: true,
        },
        include: {
            order: true,
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

    if (!venues)
        return <DashboardLoader />

    return (
        <>
            {venues.map(venue => {
                if (venue.noSeats) {
                    const reservedTicketCount = venue.order.reduce(
                        (sum, order) => (
                            order.status !== OrderStatus.CANCELLED
                            && order.status !== OrderStatus.RETURNED
                        ) ? sum += order.ticketCount : sum
                        , 0)
                    // const reservedTicketCount = venue.order.reduce((sum, order) => sum += order.ticketCount, 0)
                    
                    return <DashboardHallNoSeats
                        key={venue.id}
                        name={venue.name}
                        start={venue.start.toLocaleString('ru-RU')}
                        reserved={reservedTicketCount}
                        total={venue.ticketCount}
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
                        order: restVenue.order.map(order => ({ ...order, createdAt: order.createdAt.toLocaleString('ru-RU')}))
                    }

                    return <DashboardHall
                        key={venue.id}
                        venue={clientVenue}
                        rows={[...ticketRowMap.values()]}
                        reservedTickets={prismaTickets
                            .filter(ticket =>
                                ticket.reserved
                                || ticket.order && (ticket.order.status !== OrderStatus.CANCELLED && ticket.order.status !== OrderStatus.RETURNED)
                            )
                            .map(ticket => ticket.id)
                        }
                    />
                }
            })}
        </>
    )
    return
    return <p>Schema goes here</p>
}