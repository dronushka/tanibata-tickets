"use client"

import { File as DBFile, Order, OrderStatus, PriceRange, Row, Ticket } from "@prisma/client"
import { useState } from "react"
import { setOrderStatus as apiSetOrderStatus, sendTickets as apiSendTickets } from "@/lib/api-calls"
import { Button, Group, Input, List, Paper, Select, Stack, Text } from "@mantine/core"
import { IconCheck, IconDownload, IconEdit, IconMailForward } from "@tabler/icons-react"
import OrderStatusText from "@/components/orders/client/order-status-text"
import { useRouter } from "next/navigation"
import { PaymentData } from "../order-make/use-order"

export default function DashboardOrderForm({ order }: { order: (Omit<Order, "createdAt"> & { 
    cheque: DBFile | null,
    createdAt: string,
    tickets: (Ticket & { row: Row, priceRange: PriceRange})[],
    sentTickets: boolean
}) }) {
    // console.log(order)
    const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status)
    const [editOrderStatus, setEditOrderStatus] = useState(false)
    const [editSendTicketError, setEditSendTicketError] = useState("")
    const [setStatusError, setSetStatusError] = useState("")

    // const [ticketsIsSent, setTicketsIsSent] = useState(!!order.sentTickets)

    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const sendOrderStatus = async () => {
        setLoading(true)
        const res = await apiSetOrderStatus(order.id, orderStatus)
        if (res.success) {
            setEditOrderStatus(false)
        } else if (res.error) {
            setSetStatusError(res.error)
        }

        setLoading(false)
    }

    const sendTickets = async () => {
        setLoading(true)
        const res = await apiSendTickets(order.id)
        if (res.success) {
            router.refresh()
        } else if (res.error) {
            setEditSendTicketError(res.error)
        }

        setLoading(false)
    }

    return (
        <Paper p="sm" shadow="xs">
            <Stack>
                <Text>Номер заказа: {order.id}</Text>
                <Text>{order.price.toFixed(2)} р.</Text>
                {!editOrderStatus && <Group>
                    {!order.cheque && <Text color="red">Заказ не оплачен</Text>}
                    {order.cheque && <OrderStatusText status={orderStatus} />}
                    <Button leftIcon={<IconEdit />} onClick={() => setEditOrderStatus(true)}>Изменить</Button>
                </Group>}
                {editOrderStatus && <Group>
                    <Select
                        disabled={loading}
                        data={[
                            {
                                label: "Не оплачен",
                                value: OrderStatus.UNPAID
                            },
                            {
                                label: "В обработке",
                                value: OrderStatus.PENDING
                            },
                            {
                                label: "Запрос на возврат",
                                value: OrderStatus.RETURN_REQUESTED
                            },
                            {
                                label: "Возвращено",
                                value: OrderStatus.RETURNED
                            },
                            {
                                label: "Завершен",
                                value: OrderStatus.COMPLETE
                            },
                            {
                                label: "Отменен",
                                value: OrderStatus.CANCELLED
                            },
                            {
                                label: "Использован",
                                value: OrderStatus.USED
                            },
                        ]}
                        value={orderStatus}
                        onChange={value => value && setOrderStatus(value as OrderStatus)}
                    />
                    <Button loading={loading} leftIcon={<IconCheck />} onClick={sendOrderStatus}>Сохранить</Button>
                </Group>}
                <Input.Error>{setStatusError}</Input.Error>
                {/* <OrderStatusSelect value={orderStatus} onChange={setOrderStatus}/> */}
                <Text>{(order.paymentData as PaymentData).name}</Text>
                <Text>{(order.paymentData as PaymentData).email}</Text>
                <Text>{order.createdAt}</Text>

                {/* <Text>Места:</Text> */}
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
                <Group>
                    {!order.cheque && <Text color="red">Чек не найден</Text>} 
                    <Button
                        leftIcon={<IconDownload />}
                        component="a"
                        href={"/api/download/" + order.cheque?.id}
                        disabled={!order.cheque}
                    >
                        Скачать чек
                    </Button>
                    <Button
                        leftIcon={<IconDownload />}
                        component="a"
                        href={"/api/getTicketsPDF?orderId=" + order.id}
                    >
                        Скачать билеты
                    </Button>
                </Group>
                <Group>
                    <Text color={order.sentTickets ? "green" : "red"}>
                        {order.sentTickets ? "Билеты отправлены" : "Билеты не отправлены"}
                    </Text>
                    {/* {!order.sentTickets.length && <Text color="red">Билеты не отправлены</Text>}
                    {!!order.sentTickets.length && <Text color="green">Билеты отправлены</Text>} */}
                    <Button
                        leftIcon={<IconMailForward />}
                        loading={loading}
                        onClick={sendTickets}
                    >
                        Отправить билеты
                    </Button>
                    <Input.Error>{editSendTicketError}</Input.Error>
                </Group>
            </Stack>
        </Paper>
    )
}