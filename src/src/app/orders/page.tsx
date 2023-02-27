import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import OrdersForm from "../../components/orders/client/orders-form"

export default async function OrdersPage () {
    const session = await getServerSession()
    if (!session)
        redirect('/login')
    if (session)
        return <OrdersForm />
}