import { TicketRow } from "@/components/MakeOrder/useOrder"
import { notFound } from "next/navigation"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { OrderStatus, PriceRange, Ticket, User } from "@prisma/client"
import { z } from "zod"
import MakeOrder from "@/components/MakeOrder/MakeOrder"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Заказ билетов'].join(" | "),
}


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
                    priceRange: true
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

    const ticketRowMap: Record<string, (Ticket & { priceRange: PriceRange | null})[]> = {}

    if (venue.tickets)
        for (let ticket of venue.tickets) {
            const rowNumber = ticket.rowNumber ?? "default"

            if (!ticketRowMap[rowNumber])
                ticketRowMap[rowNumber] = []

            ticketRowMap[rowNumber].push(ticket)
        }

    return <MakeOrder
        venue={{...venue, start: venue.start.toLocaleString('ru-RU')}}
        rows={ticketRowMap}
    />
}