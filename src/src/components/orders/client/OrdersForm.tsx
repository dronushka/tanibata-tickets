'use client'
import FullAreaMessage from "@/components/FullAreaMessage"
import { requestReturn as apiRequestReturn, setOrderStatus as apiSetOrderStatus, uploadCheque } from "@/lib/api-calls"
import { Box, Button, FileButton, Group, Input, List, Loader, Paper, Stack, Text } from "@mantine/core"
import { File as DBFile, Order, OrderStatus, PriceRange, Ticket, Venue } from "@prisma/client"
import { IconDownload, IconReceiptRefund, IconUpload, IconX } from "@tabler/icons-react"
import { useState } from "react"
import OrderStatusText from "./OrderStatusText"
import { useRouter } from "next/navigation"

type HydratedOrder = Omit<Order, "createdAt"> & (
    {
        createdAt: string,
        cheque: DBFile | null,
        tickets: (Ticket & (
            {
                venue: Omit<Venue, "start"> & { start: string} | null
                priceRange: PriceRange | null
            }
        ))[]
    }
)

export default function OrdersForm({ orders }: { orders: HydratedOrder[] }) {
    const router = useRouter()

    const [loading, setLoading] = useState<number | null>(null)

    const [orderError, setOrderError] = useState<{
        orderId: number,
        error?: string
    } | null>(null)

    const sendCheque = async (orderId: number, file: File | null) => {
        if (!file)
            return

        setLoading(orderId)

        const res = await uploadCheque(orderId, file)
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

    const setOrderStatus = async (orderId: number) => {
        setLoading(orderId)

        const res = await apiSetOrderStatus(orderId, OrderStatus.CANCELLED)
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
        <Stack>
            {orders.map(order => (
                <Paper
                    key={order.id}
                    shadow="md"
                    p="md"
                    sx={{
                        maxWidth: 450
                    }}
                >
                    <Stack>
                        <Group>
                            <Text>Номер заказа: {order.id}</Text>
                            <Group>
                                <Text>Статус:</Text>
                                <OrderStatusText status={order.status} />
                            </Group>
                        </Group>
                        <Text>{order.createdAt}</Text>
                        <Text>Места:</Text>
                        <List type="ordered">
                            {order.tickets.map(ticket => (
                                <List.Item key={ticket.id} >
                                    <Group>
                                        <Text>{ticket.venue?.name}</Text>
                                        <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                        <Text>{ticket.priceRange?.price.toFixed(2)} р.</Text>
                                    </Group>
                                </List.Item>
                            ))}
                        </List>
                        <Group>
                            {
                                order.status !== OrderStatus.UNPAID && !order.cheque &&
                                <Text color="red">Чек не найден!</Text>
                            }
                            {
                                order.status !== OrderStatus.UNPAID && order.cheque &&
                                <a href={"/api/download/" + order.cheque.id}>Чек приложен</a>
                            }
                        </Group>
                        {(order.status === OrderStatus.UNPAID || order.status === OrderStatus.PENDING) &&
                            <Group>
                                <Box>
                                    <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                                    <Text color="gray" size="sm">Файл формате: jpeg, png, pdf</Text>
                                </Box>
                                <Box>
                                    {order.id === loading && <Button
                                        loading
                                        variant="outline"
                                        leftIcon={<IconUpload />}
                                    >
                                        {order.cheque ? "Приложить другой" : "Приложить чек"}
                                    </Button>}
                                    {order.id !== loading && <FileButton
                                        onChange={(value) => sendCheque(order.id, value)}
                                        accept="image/png,image/jpeg,application/pdf"
                                    >
                                        {(props) => (
                                            <Button
                                                {...props}
                                                // loading={order.id === loading}
                                                disabled={!!loading && loading !== order.id}
                                                color={orderError?.orderId === order.id ? "red" : "primary"}
                                                variant="outline"
                                                leftIcon={<IconUpload />}
                                            >
                                                {order.cheque ? "Приложить другой" : "Приложить чек"}
                                            </Button>
                                        )}
                                    </FileButton>}
                                </Box>
                            </Group>
                        }
                        <Button
                            leftIcon={<IconDownload />}
                            disabled={order.status !== OrderStatus.COMPLETE && order.status !== OrderStatus.USED}
                            component="a"
                            href={"/api/getTicketsPDF?orderId=" + order.id}
                        >
                            Скачать билеты
                        </Button>

                        {order.status === OrderStatus.UNPAID &&
                            <Button
                                leftIcon={<IconX />}
                                loading={loading === order.id}
                                disabled={!!loading && loading !== order.id}
                                onClick={() => setOrderStatus(order.id)}
                            >
                                Отменить
                            </Button>
                        }
                        {order.status !== OrderStatus.UNPAID &&
                            <Button
                                leftIcon={<IconReceiptRefund />}
                                loading={loading === order.id}
                                disabled={
                                    !!loading && loading !== order.id ||
                                    !order.cheque ||
                                    order.status === OrderStatus.RETURN_REQUESTED ||
                                    order.status === OrderStatus.RETURNED ||
                                    order.status === OrderStatus.USED ||
                                    order.status === OrderStatus.CANCELLED
                                }
                                onClick={() => requestReturn(order.id)}
                            >
                                Возврат
                            </Button>
                        }
                        <Input.Error>{orderError?.orderId === order.id ? orderError.error : ""}</Input.Error>
                    </Stack>
                </Paper>
            ))}

        </Stack>
    )
}