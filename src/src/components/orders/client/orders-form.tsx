'use client'
import FullPageMessage from "@/components/full-page-message"
import { getOrder, uploadCheque } from "@/lib/api-calls"
import { OrderStatus } from "@/types/types"
import { Box, Button, FileButton, Group, Input, List, Loader, Paper, Stack, Text } from "@mantine/core"
import { Order, PriceRange, Row, Ticket } from "@prisma/client"
import { IconDownload, IconReceiptRefund, IconUpload } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import OrderStatusText from "./order-status-text"

type HydratedOrder = Omit<Order, "createdAt"> & (
    {
        createdAt: string,
        cheque: boolean,
        tickets: (Ticket & (
            {
                row: Row,
                priceRange: PriceRange
            }
        ))[]
    }
)

export default function OrdersForm(
    { initOrders }:
        {
            initOrders: HydratedOrder[]
        }
) {
    // console.log(initOrders)

    const [orders, setOrders] = useState(initOrders)

    const getLocalDate = (strDate: string) => {
        console.log(strDate)
        return new Date(strDate).toLocaleString('ru-RU')
    }
    
    useEffect(() => {
        setOrders(initOrders)
    }, [initOrders])

    const [loading, setLoading] = useState<number | null>(null)

    const sendCheque = async (orderId: number, file: File | null) => {
        if (!file)
            return

        setLoading(orderId)

        const res = await uploadCheque(orderId, file)
        if (res.success) {
            const newOrder = await getOrder(orderId)
            if (newOrder.success)
                setOrders(prev => prev.map(order => order.id === orderId ? {...newOrder.data, createdAt: getLocalDate(newOrder.data.createdAt)} : order))
            else
                setChequeError({
                    orderId,
                    error: "Что-то пошло не так, пожалуйста обновите страницу и попробуйте снова"
                })
        } else {
            setChequeError({
                orderId,
                error: res.error
            })
        }

        setLoading(null)
    }

    const [chequeError, setChequeError] = useState<{
        orderId: number,
        error: string
    } | null>(null)


    if (!orders)
        return <FullPageMessage>
            <Loader size="xl" />
        </FullPageMessage>

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
                        maxWidth: 420
                    }}
                >
                    <Stack>
                        <Group>
                            <Text>Номер заказа: {order.id}</Text>
                            <Group>
                                <Text>Статус:</Text>
                                {!order.cheque && <Text color="red">Заказ не оплачен</Text>}
                                {order.cheque && <OrderStatusText status={order.status as OrderStatus} />}
                            </Group>
                        </Group>
                        {/* <Text>{new Date(order.createdAt).toLocaleString('ru-RU')}</Text> */}
                        <Text>{order.createdAt}</Text>
                        {/* <Text>
                            {new Intl.DateTimeFormat('ru-RU', {
                                year: 'numeric', month: 'numeric', day: 'numeric',
                                hour: 'numeric', minute: 'numeric'
                            }).format(new Date(order.createdAt))}
                        </Text> */}
                        <Text>Места:</Text>
                        <List type="ordered">
                            {order.tickets.map(ticket => (
                                <List.Item key={ticket.id} >
                                    <Group>
                                        <Text>Ряд: {ticket.row.number} Место: {ticket.number}</Text>
                                        <Text>{ticket.priceRange.price.toFixed(2)} р.</Text>
                                    </Group>
                                </List.Item>
                            ))}
                        </List>


                        {order.status === "pending" && <Group>
                            <Box>
                                {/* {cheque?.orderId === order.id && <Text>{cheque.name}</Text>} */}
                                <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                                <Text color="gray" size="sm">Файл формате: jpeg, png, pdf</Text>
                            </Box>
                            <Box>
                                {order.id === loading && <Button
                                    loading
                                    // color={chequeError?.orderId === order.id ? "red" : "primary"}
                                    variant="outline"
                                    leftIcon={<IconUpload />}
                                >
                                    Приложить чек
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
                                            color={chequeError?.orderId === order.id ? "red" : "primary"}
                                            variant="outline"
                                            leftIcon={<IconUpload />}
                                        >
                                            Приложить чек
                                        </Button>
                                    )}
                                </FileButton>}
                                <Input.Error>{chequeError?.orderId === order.id ? chequeError.error : ""}</Input.Error>
                            </Box>
                        </Group>}
                        {order.status === "complete" && <Button leftIcon={<IconDownload />}>Скачать</Button>}
                        {order.status === "complete" && <Button leftIcon={<IconReceiptRefund />}>Возврат</Button>}
                    </Stack>
                </Paper>
            ))}

        </Stack>
    )
}