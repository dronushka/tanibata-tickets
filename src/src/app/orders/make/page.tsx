import { notFound } from "next/navigation"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/db"
import { User } from "@prisma/client"
import { z } from "zod"
import { TicketRow } from "@/components/MakeOrder/types"
import FullAreaLoading from "@/components/full-area-loading"
import FullPageMessage from "@/components/full-page-message"
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
    // if (!searchParams?.venue && Number(searchParams?.venue))
    //     return <p>Мероприятие не найдено</p>

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
        
    const ticketRowMap = new Map<string, TicketRow>()

    if (venue.tickets)
        for (let ticket of venue.tickets) {
            const rowNumber = ticket.rowNumber ?? "default"

            if (!ticketRowMap.has(rowNumber))
                ticketRowMap.set(rowNumber, { number: rowNumber, tickets: [] })

            ticketRowMap.get(rowNumber)?.tickets.push(ticket)
        }

    return <MakeOrder
        paymentData={
            {
                name: user?.name ?? "",
                email: user?.email ?? "",
                age: user?.age ? String(user.age) : "",
                phone: user?.phone ?? "",
                nickname: user?.nickname ?? "",
                social: user?.social ?? "",
            }
        }
        venue={venue && {
            ...venue,
            start: venue.start.toLocaleString("ru-RU"),
            rows: [...ticketRowMap.values()]
        }}
    />
}