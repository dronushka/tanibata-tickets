import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import OrdersForm from "../../components/orders/client/OrdersForm"

export default async function OrdersPage() {
    const session = await getServerSession(authOptions)
    if (!session)
        redirect('/login')

    // console.log(session)

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id
        },
        include: {
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
        createdAt: order.createdAt.toLocaleString('ru-RU'),
        tickets: order.tickets.map(ticket => ({ ...ticket, venue: { ...ticket.venue, start: ticket.venue?.start.toLocaleString('ru-RU')}}))
    }))}/>
}