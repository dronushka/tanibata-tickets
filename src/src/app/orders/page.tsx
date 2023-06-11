import LoginForm from "@/components/LoginForm"
import { prisma } from "@/lib/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { notFound, redirect } from "next/navigation"
import OrdersForm from "../../components/orders/client/OrdersForm"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Мои заказы'].join(" | ")
}

export default async function OrdersPage() {
    // notFound()
    // return <></>

    const session = await getServerSession(authOptions)
    if (!session?.user.id)
        return <LoginForm />

    // console.log('orders session', session)

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            venue: {
                include: {
                    priceRange: true
                }
            },
            cheque: true,
            tickets: {
                include: {
                    priceRange: true,
                    venue: true,
                },
                orderBy: [
                    { sortRowNumber: "asc" },
                    { sortNumber: "asc" }
                ]
            }
        },
    })

    // console.log(orders)
    return <OrdersForm orders={orders.map(order => ({
        ...order,
        venue: order.venue && { ...order.venue, start: order.venue.start.toLocaleString('ru-RU') },
        createdAt: order.createdAt.toLocaleString('ru-RU'),
        tickets: order.tickets.map(ticket => ({ ...ticket, venue: ticket.venue && { ...ticket.venue, start: ticket.venue.start.toLocaleString('ru-RU')}}))
    }))}/>
}