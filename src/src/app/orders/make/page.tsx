import { prisma } from "@/db"
import { User } from "@prisma/client"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { TicketRow } from "@/components/order-make/use-order"
import MakeOrder from "@/components/order-make/make-order"

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
    const vanueIdValidated = venueIdValidator.parse(searchParams?.venue)

    // if (!searchParams?.venue && Number(searchParams?.venue))
    //     return <p>Мероприятие не найдено</p>

    const venue = await prisma.venue.findUnique({
        where: {
            id: Number(vanueIdValidated)
        },
        include: {
            tickets: {
                include: {
                    priceRange: true
                },
                orderBy: [
                    { sortRowNumber: "asc" },
                    { sortNumber: "desc" }
                ]
            }
        }
    })

    // const ticketRows: Map<string, Ticket & { priceRange: PriceRange}> = new Map
    const ticketRowMap = new Map<string, TicketRow>()

    if (venue?.tickets)
        for (let ticket of venue.tickets) {
            const rowNumber = ticket.rowNumber ?? "default"

            if (!ticketRowMap.has(rowNumber))
                ticketRowMap.set(rowNumber, { number: rowNumber, tickets: [] })

            ticketRowMap.get(rowNumber)?.tickets.push(ticket)
        }

    return <MakeOrder
        user={user && {
            ...user,
            createdAt: user.createdAt.toLocaleString("ru-RU")
        }}
        venue={venue && {
            ...venue,
            start: venue.start.toLocaleString("ru-RU"),
            rows: [...ticketRowMap.values()]
        }}
    />
}