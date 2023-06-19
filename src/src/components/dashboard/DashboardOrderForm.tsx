"use client"

import { File as DBFile, Order, OrderStatus, PriceRange, Ticket, Venue } from "@prisma/client"
import { useState } from "react"
import { setOrderStatus as apiSetOrderStatus, sendTickets as apiSendTickets, setOrderNotes } from "@/lib/api-calls"
import { Button, Container, createStyles, Divider, Group, Input, List, Paper, Select, Stack, Text, Textarea } from "@mantine/core"
import { IconCheck, IconDownload, IconEdit, IconMailForward } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import OrderStatusText from "../../app/orders/components/OrderStatusText"
import { PaymentData } from "@/app/orders/make/hooks/useOrder"

const useStyles = createStyles((theme) => ({
    header: {
        flexBasis: 120
    },
}))

export default function DashboardOrderForm({ order }: {
    order: (Omit<Order, "createdAt"> & {
        venue: Omit<Venue, "start"> & { start: string } | null,
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
    const [notesError, setNotesError] = useState("")

    const [notes, setNotes] = useState(order.notes)

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

    const sendOrderNotes = async () => {
        setLoading(true)
        const res = await setOrderNotes(order.id, notes)
        if (res.success) {
            setNotesError("")
        } else if (res.error) {
            setNotesError(res.error)
        }

        setLoading(false)
    }

    const { classes } = useStyles()

    return (
        <>
            <Paper p="sm" shadow="xs">
                <Stack>
                    <Text fw="bold">{order.venue?.name}</Text>
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
                        {order.isGoodness && <Text fw="bold">(Билеты добро)</Text>}
                    </Group>

                    {!editOrderStatus && <Group>
                        <OrderStatusText status={orderStatus} />
                        {
                            orderStatus !== OrderStatus.CANCELLED
                            && orderStatus !== OrderStatus.RETURNED
                            && <Button leftIcon={<IconEdit />} onClick={() => setEditOrderStatus(true)}>Изменить</Button>
                        }
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
                    {order.venue?.noSeats === false && <Group sx={{ alignItems: "flex-start" }}>
                        <Text className={classes.header}>Места:</Text>
                        <List type="ordered">
                            {order.tickets.map(ticket => (
                                <List.Item key={ticket.id}>
                                    <Group>
                                        <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                        <Text>{order.isGoodness ? `${ticket.priceRange?.price.toFixed(2)} (${Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0).toFixed(2)})` : ticket.priceRange?.price.toFixed(2)} р.</Text>
                                    </Group>
                                </List.Item>
                            ))}
                        </List>
                    </Group>}
                    {order.venue?.noSeats === true && <Text>Количество мест: {order.ticketCount}</Text>}
                    {!!order.comment.length && <Group>
                        <Text>Комментарий пользователя:</Text>
                        <Text>{order.comment}</Text>
                    </Group>}
                    <Stack>
                        <Textarea
                            // sx={{ flexGrow: 1 }}
                            label="Заметки"
                            value={notes}
                            onChange={e => {
                                setNotesError("")
                                setNotes(e.target.value)
                            }}
                        />
                        <Button sx={{ maxWidth: 200 }} variant="default" loading={loading} onClick={sendOrderNotes}>Сохранить</Button>
                        <Input.Error>{notesError}</Input.Error>
                    </Stack>
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
            {order.cheque && <Container sx={{marginTop: 10}}>
                <iframe src={"/api/view/" + order.cheque?.id} width="100%" height={800}/>
            </Container>}
        </>
    )
}