// import type { Metadata } from 'next'
import DashboardOrderForm from "@/components/dashboard/DashboardOrderForm"
import Dashboard501 from "@/components/Dashboard501"
import LoginForm from "@/components/LoginForm"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { OrderStatus, PriceRange, Role, Ticket } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import setOrderStatus from "./actions/setOrderStatus"
import setOrderNotes from "./actions/setOrderNotes"
import sendTickets from "./actions/sendTickets"
import removeTicket from "./actions/removeTicket"
import addTickets from "./actions/addTickets"

export const metadata = {
    title: [process.env.FEST_TITLE, "Админка", "Детали заказа"].join(" | "),
}

export const revalidate = 0

export default async function OrderPage({ params }: { params: { orderId: number } }) {
    const session = await getServerSession(authOptions)

    if (!session) return <LoginForm />

    if (session?.user.role !== Role.ADMIN) return <Dashboard501 />

    const validator = z.number()
    const res = validator.safeParse(Number(params.orderId))

    if (!res.success) return <p>Заказ не найден</p>

    const order = await prisma.order.findUnique({
        where: {
            id: res.data,
        },
        include: {
            venue: {            
                include: { 
                    priceRange: true,
                    tickets: {
                        include: {
                            priceRange: true,
                        },
                        orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "desc" }],
                    }
                },
            },
            cheque: true,
            sentTickets: true,
            tickets: {
                include: {
                    priceRange: true,
                },
                orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "asc" }],
            },
        },
    })

    if (!order) return <p>Заказ не найден</p>
    if (!order.venue) return <p>Заказ не привязан к площадке</p>

    const ticketRowMap: Record<
        string,
        (Ticket & { priceRange: PriceRange | null })[]
    > = {}

    let reservedTickets: number[] | number = 0

    if (order.venue?.noSeats) {
        reservedTickets = (await prisma.order.aggregate({
            where: {
                AND: [
                    { venueId: order.venue.id },
                    { NOT: { status: OrderStatus.CANCELLED } },
                    { NOT: { status: OrderStatus.RETURNED } }
                ],

            },
            _sum: {
                ticketCount: true
            }
        }))._sum.ticketCount ?? 0


    } else {
        if (order.venue.tickets)
            for (let ticket of order.venue.tickets) {
                const rowNumber = ticket.rowNumber ?? "default"

                if (!ticketRowMap[rowNumber]) ticketRowMap[rowNumber] = []

                ticketRowMap[rowNumber].push(ticket)
            }

        const tickets = await prisma.ticket.findMany({
            where: {
                AND: [
                    {
                        order: { venueId: order.venue.id }
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
        <DashboardOrderForm
            order={{
                ...order,
                venue: order.venue && { ...order.venue, start: order.venue.start.toLocaleString("ru-RU") },
                createdAt: order.createdAt.toLocaleString("ru-RU"),
                sentTickets: !!order.sentTickets.length,
            }}
            rows={ticketRowMap}
            reservedTickets={reservedTickets}
            mutations={{
                setOrderStatus,
                setOrderNotes,
                sendTickets,
                removeTicket,
                addTickets
            }}
        />
    )
}
