import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import OrdersForm from "../../components/orders/client/orders-form"

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
                    row: true
                },
                orderBy: [
                    { row: { number: "asc" } },
                    { sortNumber: "asc" }
                ]
            }
        },

    })

    // console.log(orders)
    return <OrdersForm orders={orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toLocaleString('ru-RU')
    }))}/>
}