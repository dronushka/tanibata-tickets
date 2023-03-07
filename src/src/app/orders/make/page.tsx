import { TicketRow } from "@/components/MakeOrder/useOrder"
import { notFound } from "next/navigation"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { OrderStatus, User } from "@prisma/client"
import { z } from "zod"
import MakeOrder from "@/components/MakeOrder/MakeOrder"

export default async function MakeOrderPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const session = await getServerSession(authOptions)

    let user: User | null = null

    if (session?.user?.id)
        user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        })

    const venueIdValidator = z.string().regex(/^\d+$/)
    const venueIdValidated = venueIdValidator.safeParse(searchParams?.venue)

    if (venueIdValidated.success === false)
        notFound()

    const venue = await prisma.venue.findUnique({
        where: {
            id: Number(venueIdValidated.data)
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

    if (venue === null)
        notFound()

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

    return <MakeOrder
        venue={clientVenue}
    />
}