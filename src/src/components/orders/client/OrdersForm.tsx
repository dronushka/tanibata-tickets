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
import MyRpcClientComponent from "@/components/MyRpcClientComponent"

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

export default function OrdersForm({ orders }: { orders: HydratedOrder[] }) {
    
    const router = useRouter()

    const [loading, setLoading] = useState<number | null>(null)

    const [returnConfirmationOrderId, setReturnConfirmationOrderId] = useState<number | null>(null)

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
        <>
            <Stack>
                <MyRpcClientComponent/>
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
                                    <OrderStatusTooltip status={order.status} />
                                </Group>
                            </Group>
                            <Text>{order.createdAt}</Text>
                            <Text fw="bold">{order.venue?.name}</Text>
                            {order.isGoodness && <Text
                                fw="bold"
                            // sx={{
                            //     backgroundClip: "text",
                            //     backgroundImage: "linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red)",
                            //     color: "transparent"
                            // }}
                            >
                                Добро активировано!
                            </Text>}
                            {order.venue?.noSeats === false && <>
                                <Text>Места:</Text>
                                <List type="ordered">
                                    {order.tickets.map(ticket => (
                                        <List.Item key={ticket.id} >
                                            <Group>
                                                {/* <Text>{ticket.venue?.name}</Text> */}
                                                <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                                <Text>{order.isGoodness ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0).toFixed(2) : ticket.priceRange?.price.toFixed(2)} р.</Text>
                                            </Group>
                                        </List.Item>
                                    ))}
                                </List>
                            </>}
                            {order.venue?.noSeats === true && <>
                                <Text>Количество билетов: {order.ticketCount}</Text>
                            </>}
                            {!!order.comment.length && <>
                                <Text>Комментарий:</Text>
                                <Text>{order.comment}</Text>
                            </>}
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
                                    onClick={() => setReturnConfirmationOrderId(order.id)}
                                >
                                    Возврат
                                </Button>
                            }
                            <Input.Error>{orderError?.orderId === order.id ? orderError.error : ""}</Input.Error>
                        </Stack>
                    </Paper>
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