import ClientDashboard from "@/components/dashboard/client-dashboard"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function DashboardPage () {
    const session = await getServerSession(authOptions)
    console.log(session?.user)
    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    return <ClientDashboard/>
}