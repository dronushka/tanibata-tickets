"use client"

import {
    File as DBFile,
    Order,
    PriceRange,
    Ticket,
    Venue,
} from "@prisma/client"
import { ServerAction } from "@/types/types"
import { Loader, Stack, Text } from "@mantine/core"
import FullAreaMessage from "@/components/FullAreaMessage"
import OrderItem from "./OrderItem"

type HydratedOrder = Omit<Order, "createdAt"> & {
    createdAt: string
    venue:
        | (Omit<Venue, "start"> & { start: string; priceRange: PriceRange[] })
        | null
    cheque: DBFile | null
    tickets: (Ticket & {
        venue: (Omit<Venue, "start"> & { start: string }) | null
        priceRange: PriceRange | null
    })[]
}

type Mutations = {
    requestReturn: ServerAction
    cancelOrder: ServerAction
    uploadCheque: ServerAction
}

export default function OrdersForm({
    orders,
    mutations,
}: {
    orders: HydratedOrder[]
    mutations: Mutations
}) {
    if (!orders)
        return (
            <FullAreaMessage>
                <Loader size="xl" />
            </FullAreaMessage>
        )

    if (orders.length === 0) return <Text>У вас пока нет заказов</Text>

    return (
        <Stack>
            {orders.map((order) => (
                <OrderItem key={order.id} order={order} mutations={mutations} />
            ))}
        </Stack>
    )
}