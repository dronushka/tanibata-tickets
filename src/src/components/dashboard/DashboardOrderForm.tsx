"use client"

import { File as DBFile, Order, OrderStatus, PriceRange, Ticket } from "@prisma/client"
import { useState } from "react"
import { setOrderStatus as apiSetOrderStatus, sendTickets as apiSendTickets } from "@/lib/api-calls"
import { Button, createStyles, Group, Input, List, Paper, Select, Stack, Text } from "@mantine/core"
import { IconCheck, IconDownload, IconEdit, IconMailForward } from "@tabler/icons-react"

import { useRouter } from "next/navigation"

import Link from "next/link"
import OrderStatusText from "../orders/client/OrderStatusText"
import { PaymentData } from "../MakeOrder/useOrder"

const useStyles = createStyles((theme) => ({
    header: {
        flexBasis: 120
    },
}))

export default function DashboardOrderForm({ order }: {
    order: (Omit<Order, "createdAt"> & {
        cheque: DBFile | null,
        createdAt: string,
        tickets: (Ticket & { priceRange: PriceRange | null })[],
        sentTickets: boolean
    })
}) {
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
            setSetStatusError("")
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

    const { classes } = useStyles()

    return (
        <Paper p="sm" shadow="xs">
            <Stack>
                <Group>
                    <Text className={classes.header}>Номер заказа:</Text>
                    <Text>{order.id}</Text>
                </Group>
                <Group>
                    <Text className={classes.header}>Дата заказа:</Text>
                    <Text>{order.createdAt}</Text>
                </Group>
                <Group>
                    <Text className={classes.header}>Сумма заказа:</Text>
                    <Text>{order.price.toFixed(2)} р.</Text>
                </Group>

                {!editOrderStatus && <Group>
                    <OrderStatusText status={orderStatus} />
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
                <Group>
                    <Text className={classes.header}>ФИО:</Text>
                    <Text>{(order.paymentData as PaymentData).name}</Text>
                </Group>
                <Group>
                    <Text className={classes.header}>E-mail:</Text>
                    <Text>{(order.paymentData as PaymentData).email}</Text>
                </Group>
                <Group>
                    <Text className={classes.header}>Телефон:</Text>
                    <Text>{(order.paymentData as PaymentData).phone}</Text>
                </Group>
                <Group>
                    <Text className={classes.header}>Ссылка на VK:</Text>
                    {(order.paymentData as PaymentData).social && <Link target="_blank" href={(order.paymentData as PaymentData).social}>{(order.paymentData as PaymentData).social}</Link>}
                    {!(order.paymentData as PaymentData).social && <Text>Нет</Text>}
                </Group>
                <Group sx={{ alignItems: "flex-start" }}>
                    <Text className={classes.header}>Места:</Text>
                    <List type="ordered">
                        {order.tickets.map(ticket => (
                            <List.Item key={ticket.id}>
                                <Group>
                                    <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                    <Text>{ticket.priceRange?.price.toFixed(2) ?? 0} р.</Text>
                                </Group>
                            </List.Item>
                        ))}
                    </List>
                </Group>
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