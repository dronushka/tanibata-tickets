import { cache } from 'react'
import { notFound } from "next/navigation"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"
import { OrderStatus, PriceRange, Ticket, User } from "@prisma/client"
import { z } from "zod"
import MakeOrder from "./components/MakeOrder"
import createOrder from "./actions/createOrder"
import payOrder from "./actions/payOrder"

export const metadata = {
    title: [process.env.FEST_TITLE, "Заказ билетов"].join(" | "),
}

export const revalidate = 0

export default async function MakeOrderPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const session = await getServerSession(authOptions)

    let user: User | null = null

    if (session?.user?.id)
        user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        })

    const venueIdValidator = z.string().regex(/^\d+$/)
    const venueIdValidated = venueIdValidator.safeParse(searchParams?.venue)

    if (venueIdValidated.success === false) notFound()

    const getVenue = cache(async (venueId: number) => await prisma.venue.findUnique({
        where: {
            id: venueId, //Number(venueIdValidated.data),
        },
        include: {
            priceRange: true,
            tickets: {
                include: {
                    priceRange: true,
                },
                orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "desc" }],
            },
        },
    }))

    const venue = await getVenue(Number(venueIdValidated.data))

    if (venue === null) notFound()

    const ticketRowMap: Record<
        string,
        (Ticket & { priceRange: PriceRange | null })[]
    > = {}

    let reservedTickets: number[] | number = 0

    if (venue.tickets)
        for (let ticket of venue.tickets) {
            const rowNumber = ticket.rowNumber ?? "default"

            if (!ticketRowMap[rowNumber]) ticketRowMap[rowNumber] = []

            ticketRowMap[rowNumber].push(ticket)
        }

        if (venue.noSeats) {
            reservedTickets = (await prisma.order.aggregate({
                where: {
                    AND: [
                        { venueId: venue.id },
                        { NOT: { status: OrderStatus.CANCELLED } },
                        { NOT: { status: OrderStatus.RETURNED } }
                    ],

                },
                _sum: {
                    ticketCount: true
                }
            }))._sum.ticketCount ?? 0

    
        } else {
            const tickets = await prisma.ticket.findMany({
                where: {
                    AND: [
                        {
                            order: { venueId: venue.id }
                        },
                        {
                            OR: [
                                {
                                    reserved: true
                                },
                                {
                                    order: {
                                        AND: [
                                            { NOT: { status: OrderStatus.CANCELLED } },
                                            { NOT: { status: OrderStatus.RETURNED } }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                },
                select: { id: true }
            })
            reservedTickets = tickets.map(ticket => ticket.id)
        }
    return (
        <MakeOrder
            initialOrder={{
                venueId: venue.id,
                noSeats: venue.noSeats,
                isGoodness: false,
                comment: "",
                paymentData: {
                    name: user?.name ?? "",
                    email: user?.email ?? "",
                    age: user?.age ? String(user?.age) : "",
                    phone: user?.phone ?? "",
                    nickname: user?.nickname ?? "",
                    social: user?.social ?? ""
                },
                ticketCount: 0
            }}
            venue={{ ...venue, start: venue.start.toLocaleString("ru-RU") }}
            rows={ticketRowMap}
            reservedTickets={reservedTickets}
            mutations={{
                createOrder,
                payOrder
            }}
        />
    )
}
