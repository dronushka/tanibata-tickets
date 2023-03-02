import DashboardOrderForm from "@/components/dashboard/dashboard-order-form"
import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { PaymentData } from "@/types/types"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { z } from "zod"

export default async function OrderPage({ params: { orderId } }: { params: { orderId: string } }) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    const validator = z.number()
    const res = validator.safeParse(parseInt(orderId))

    if (!res.success)
        return <p>Заказ не найден</p>

    const order = await prisma.order.findUnique({
        where: {
            id: res.data
        },
        include: {
            cheque: true,
            tickets: {
                include: {
                    row: true,
                    priceRange: true
                }
            }
        }
    })

    if (!order)
        return <p>Заказ не найден</p>

    console.log(order)

    return <DashboardOrderForm order={{
        ...order,
        paymentData: order.paymentData as PaymentData,
        createdAt: order.createdAt.toString()
    }}/>
}