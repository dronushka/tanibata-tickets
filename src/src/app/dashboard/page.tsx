import ClientDashboard from "@/components/dashboard/client-dashboard"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function DashboardPage () {
    const session = await getServerSession()

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    return <ClientDashboard/>
}