import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import DashboardOrders from "@/components/dashboard/dashboard-orders"
import { prisma } from "@/db"
import { PaymentData } from "@/types/types"
import { z } from "zod"

const perPage = 2

export default async function DashboardOrdersPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    // const pageNumber = searchParams?.page && typeof searchParams.page === "string" ? parseInt(searchParams?.page) : 1
    let pageNumber = 1
    const pageNumberValidator = z.string().regex(/^\d+$/)
    const res = pageNumberValidator.safeParse(searchParams?.page)

    if (res.success)
        pageNumber = Number(res.data)

    let filter = ""
    const filterValidator = z.string()
    const resFilter = filterValidator.safeParse(searchParams?.filter)

    if (resFilter.success)
        filter = resFilter.data

    const orders = await prisma.order.findMany({
        where: {
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
        },
        include: {
            tickets: {
                include: {
                    row: true,
                    priceRange: true
                }
            }
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: (pageNumber - 1) * perPage,
        take: perPage
    })

    const orderCount = await prisma.order.count({
        where: {
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
    })

    // console.log({pageNumber, orders})
    return <DashboardOrders
        orders={
            orders.map(
                order => ({
                    ...order,
                    paymentData: order.paymentData as PaymentData,
                    createdAt: order.createdAt.toString()
                }))
        }
        pagination={{
            page: pageNumber,
            pageCount: Math.floor(orderCount / perPage)
        }}
        filter={filter}
        category=""
    />
}