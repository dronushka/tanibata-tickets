import DashboardHall from "@/components/dashboard/DashboardHall"
import DashboardLoader from "@/components/dashboard/DashboardLoader"
import DashboardHallNoSeats from "@/components/dashboard/DashboardHallNoSeats"
import { TicketRow } from "@/components/MakeOrder/useOrder"
import { prisma } from "@/lib/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Order, OrderStatus, PriceRange, Role, Ticket } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import LoginForm from "@/components/LoginForm"
import Dashboard501 from "@/components/Dashboard501"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка'].join(" | ")
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session)
        return <LoginForm />
        
    if (session?.user.role !== Role.ADMIN)
        return <Dashboard501 />

    const venues = await prisma.venue.findMany({
        where: {
            active: true,
        },
        include: {
            priceRange: true,
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
                    const ticketRowMap = new Map<string, 
                        {
                            number: string,
                            tickets: (Ticket & { 
                                priceRange: PriceRange | null, 
                                order: Omit<Order, "createdAt"> & { createdAt: string } | null
                            })[]
                        }
                    >()

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