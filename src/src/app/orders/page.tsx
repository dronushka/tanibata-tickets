import LoginForm from "@/components/LoginForm"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import OrdersForm from "./components/OrdersForm"
import uploadCheque from "./actions/uploadCheque" //TODO workaround. should be imported in client component rather than passed as prop.
import cancelOrder from "./actions/cancelOrder"
import requestReturn from "./actions/requestReturn"

export const metadata = {
    title: [process.env.FEST_TITLE, "Мои заказы"].join(" | "),
}

export default async function OrdersPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.id) return <LoginForm />

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            venue: {
                include: {
                    priceRange: true,
                },
            },
            cheque: true,
            tickets: {
                include: {
                    priceRange: true,
                    venue: true,
                },
                orderBy: [{ sortRowNumber: "asc" }, { sortNumber: "asc" }],
            },
        },
    })

    return (
        <OrdersForm
            orders={orders.map((order) => ({
                ...order,
                venue: order.venue && {
                    ...order.venue,
                    start: order.venue.start.toLocaleString("ru-RU"),
                },
                createdAt: order.createdAt.toLocaleString("ru-RU"),
                tickets: order.tickets.map((ticket) => ({
                    ...ticket,
                    venue: ticket.venue && {
                        ...ticket.venue,
                        start: ticket.venue.start.toLocaleString("ru-RU"),
                    },
                })),
            }))}
            mutations={{
                cancelOrder,
                requestReturn,
                uploadCheque
            }}
        />
    )
}
