'use client'
import FullAreaMessage from "@/components/FullAreaMessage"
import { requestReturn as apiRequestReturn, setOrderStatus as apiSetOrderStatus, uploadCheque } from "@/lib/api-calls"
import { Box, Button, FileButton, Group, Input, List, Loader, Modal, Paper, Stack, Text } from "@mantine/core"
import { File as DBFile, Order, OrderStatus, PriceRange, Ticket, Venue } from "@prisma/client"
import { IconDownload, IconReceiptRefund, IconUpload, IconX } from "@tabler/icons-react"
import { useState } from "react"
import OrderStatusText from "./OrderStatusText"
import { useRouter } from "next/navigation"
import OrderStatusTooltip from "./OrderStatusTooltip"
import OrderItem from "./OrderItem"
import { ServerMutation, ServerMutations } from "@/types/types"

type HydratedOrder = Omit<Order, "createdAt"> & (
    {
        createdAt: string,
        venue: Omit<Venue, "start"> & { start: string, priceRange: PriceRange[] } | null
        cheque: DBFile | null,
        tickets: (Ticket & (
            {
                venue: Omit<Venue, "start"> & { start: string } | null
                priceRange: PriceRange | null
            }
        ))[]
    }
)

type Mutations = {
    cancelOrder: ServerMutation,
    uploadCheque: ServerMutation
}

export default function OrdersForm({ orders, mutations }: { orders: HydratedOrder[], mutations: Mutations }) {
    const router = useRouter()

    const [loading, setLoading] = useState<number | null>(null)

    const [returnConfirmationOrderId, setReturnConfirmationOrderId] = useState<number | null>(null)

    const [orderError, setOrderError] = useState<{
        orderId: number,
        error?: string
    } | null>(null)

    const requestReturn = async (orderId: number) => {
        setLoading(orderId)

        const res = await apiRequestReturn(orderId)
        if (res.success) {
            router.refresh()
        } else {
            setOrderError({
                orderId,
                error: res.error
            })
        }

        setLoading(null)
    }

    if (!orders)
        return <FullAreaMessage>
            <Loader size="xl" />
        </FullAreaMessage>

    if (orders.length === 0)
        return <Text>У вас пока нет заказов</Text>

    return (
        <>
            <Stack>
                {orders.map(order => (
                    <OrderItem key={order.id} order={order} mutations={mutations}/>
                ))}

            </Stack>
            <Modal opened={!!returnConfirmationOrderId} onClose={() => setReturnConfirmationOrderId(null)} title="Подвердите возврат" centered>
                <Text mb="md">Вы точно уверены, что хотите отказаться от билета?</Text>
                <Group sx={{ justifyContent: "flex-end" }}>
                    <Button variant="default" onClick={() => setReturnConfirmationOrderId(null)}>Нет</Button>
                    <Button onClick={() => {
                        if (returnConfirmationOrderId) {
                            requestReturn(returnConfirmationOrderId)
                            setReturnConfirmationOrderId(null)
                        }
                    }}
                    >
                        Да
                    </Button>
                </Group>
            </Modal>
        </>
    )
}