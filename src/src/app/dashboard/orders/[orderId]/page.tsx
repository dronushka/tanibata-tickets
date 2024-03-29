// import type { Metadata } from 'next'
import DashboardOrderForm from "@/components/dashboard/DashboardOrderForm"
import Dashboard501 from "@/components/Dashboard501"
import LoginForm from "@/components/LoginForm"
import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Role } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { z } from "zod"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка', 'Детали заказа'].join(" | ")
}

export default async function OrderPage({ params: { orderId } }: { params: { orderId: string } }) {
    const session = await getServerSession(authOptions)

    if (!session)
        return <LoginForm />
        
    if (session?.user.role !== Role.ADMIN)
        return <Dashboard501 />

    const validator = z.number()
    const res = validator.safeParse(parseInt(orderId))

    if (!res.success)
        return <p>Заказ не найден</p>

    const order = await prisma.order.findUnique({
        where: {
            id: res.data
        },
        include: {
            venue: true,
            cheque: true,
            sentTickets: true,
            tickets: {
                include: {
                    priceRange: true
                },
                orderBy: [
                    { sortRowNumber: "asc" },
                    { sortNumber: "asc" }
                ]
            }
        }
    })

    if (!order)
        return <p>Заказ не найден</p>

    // console.log(order)

    return <DashboardOrderForm order={{
        ...order,
        venue: order.venue && {...order.venue, start: order.venue.start.toLocaleString('ru-RU')},
        createdAt: order.createdAt.toLocaleString('ru-RU'),
        sentTickets: !!order.sentTickets.length
    }}/>
}