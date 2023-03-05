import DashboardOrderForm from "@/components/dashboard/dashboard-order-form"
import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { z } from "zod"

export default async function OrderPage({ params: { orderId } }: { params: { orderId: string } }) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    const validator = z.number()
    const res = validator.safeParse(parseInt(orderId))

    if (!res.success)
        return <p>Заказ не найден</p>

    const order = await prisma.order.findUnique({
        where: {
            id: res.data
        },
        include: {
            cheque: true,
            sentTickets: true,
            tickets: {
                include: {
                    row: true,
                    priceRange: true
                },
                orderBy: [
                    { row: { number: "asc" } },
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
        createdAt: order.createdAt.toLocaleString('ru-RU'),
        sentTickets: !!order.sentTickets.length
    }}/>
}