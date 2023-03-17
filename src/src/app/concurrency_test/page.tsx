import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import ClientConcurrencyTest from "./ClientConcurrencyTest"

export default async function ConcurrencyTestPage () {
    // const session = await getServerSession(authOptions)

    // if (session?.user.role !== Role.ADMIN)
    //     redirect('/dashboard/login')

    return <ClientConcurrencyTest />
}