import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/db"
import { z } from "zod"
import DashboardOrders from "@/components/dashboard/dashboard-orders"
import { OrderStatus, Prisma } from "@prisma/client"

const perPage = 20

export default async function DashboardOrdersPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    const pageNumberValidated = z.string().regex(/^\d+$/).safeParse(searchParams?.page)
    const pageNumber = pageNumberValidated.success ? pageNumberValidated.data : "1"

    const filterValidated = z.string().safeParse(searchParams?.filter)
    const filter = filterValidated.success ? filterValidated.data : undefined

    const statusValidated = z.nativeEnum(OrderStatus).safeParse(searchParams?.status)
    const status = statusValidated.success ? statusValidated.data : undefined

    // const filterWhere = filter && 

    const statusWhere = status && {
        status
    }

    const ordersAndWhere = []
    if (filter)
        ordersAndWhere.push(
            {
                OR: [
                    {
                        paymentData: {
                            path: "$.name",
                            string_contains: filter
                        }
                    },
                    {
                        paymentData: {
                            path: "$.email",
                            string_contains: filter
                        }
                    }
                ]
            }
        )

    if (status)
        ordersAndWhere.push({ status })
    

    const orders = await prisma.order.findMany({
        where: {AND: ordersAndWhere},
        include: {
            cheque: true,
            sentTickets: true,
            tickets: {
                include: {
                    row: true,
                    priceRange: true
                }
            }
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: (Number(pageNumber) - 1) * perPage,
        take: perPage
    })

    const orderCount = await prisma.order.count({
        where: {AND: ordersAndWhere}
    })

    return <DashboardOrders
        orders={
            orders.map(
                order => ({
                    ...order,
                    createdAt: order.createdAt.toLocaleString('ru-RU'),
                    sentTickets: !!order.sentTickets.length
                }))
        }
        pagination={{
            page: Number(pageNumber),
            pageCount: Math.ceil(orderCount / perPage)
        }}
        filter={filter}
        status={status}
    />
}