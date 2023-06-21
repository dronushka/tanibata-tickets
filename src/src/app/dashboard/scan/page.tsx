import { getServerSession } from "next-auth/next"
import TicketScanner from "@/components/dashboard/TicketScanner"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import LoginForm from "@/components/LoginForm"
import Dashboard501 from "@/components/Dashboard501"
import { Role } from "@prisma/client"
import getOrder from "./actions/getOrder"
import setOrderStatus from "../orders/[orderId]/actions/setOrderStatus"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка', 'Сканер билетов'].join(" | ")
}

export default async function ScanPage() {
    const session = await getServerSession(authOptions)

    if (!session)
        return <LoginForm />

    if (session?.user.role !== Role.ADMIN)
        return <Dashboard501 />

    return <TicketScanner setOrderStatus={setOrderStatus} />
}