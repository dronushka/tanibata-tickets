"use client"

import { File as DBFile, Order, OrderStatus, PriceRange, Ticket, Venue } from "@prisma/client"
import { useState, useTransition } from "react"
import {
    ActionIcon,
    Button,
    Container,
    createStyles,
    Divider,
    Group,
    Input,
    List,
    Modal,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
} from "@mantine/core"
import { IconCheck, IconDownload, IconEdit, IconMailForward, IconX } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import OrderStatusText from "../../app/orders/components/OrderStatusText"
import { PaymentData } from "@/app/orders/make/[venueId]/hooks/useOrder"
import { ServerAction } from "@/types/types"
import { IconCross } from "@tabler/icons-react"
import DashboardOrderFormTicketDeleteButton from "./DashboardOrderFormTicketDeleteButton"
import TicketsPicker from "@/app/orders/make/[venueId]/components/TicketsPicker/TicketsPicker"
import TicketsForm from "@/app/orders/make/[venueId]/components/TicketsForm"

const useStyles = createStyles((theme) => ({
    header: {
        flexBasis: 120,
    },
}))

export default function DashboardOrderForm({
    order,
    rows,
    reservedTickets,
    mutations,
}: {
    order: Omit<Order, "createdAt"> & {
        venue: (Omit<Venue, "start"> & { start: string; priceRange: PriceRange[] }) | null
        cheque: DBFile | null
        createdAt: string
        tickets: (Ticket & { priceRange: PriceRange | null })[]
        sentTickets: boolean
    }
    rows: Record<string, (Ticket & { priceRange: PriceRange | null })[]>
    reservedTickets: number[] | number
    mutations: {
        setOrderStatus: ServerAction
        setOrderNotes: ServerAction
        sendTickets: ServerAction
        removeTicket: ServerAction
        addTickets: ServerAction
        setNoSeatTickets: ServerAction
    }
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status)
    const [editOrderStatus, setEditOrderStatus] = useState(false)
    const [editSendTicketError, setEditSendTicketError] = useState("")
    const [setStatusError, setSetStatusError] = useState("")
    const [notes, setNotes] = useState(order.notes)
    const [notesError, setNotesError] = useState("")
    const [showTicketPicker, setShowTicketPicker] = useState(false)
    const [showTicketForm, setShowTicketForm] = useState(false)

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

                    {!editOrderStatus && (
                        <Group>
                            <OrderStatusText status={orderStatus} />
                            {orderStatus !== OrderStatus.CANCELLED && orderStatus !== OrderStatus.RETURNED && (
                                <Button leftIcon={<IconEdit />} onClick={() => setEditOrderStatus(true)}>
                                    Изменить
                                </Button>
                            )}
                        </Group>
                    )}
                    {editOrderStatus && (
                        <Group>
                            <Select
                                disabled={isPending}
                                data={[
                                    {
                                        label: "Не оплачен",
                                        value: OrderStatus.UNPAID,
                                    },
                                    {
                                        label: "В обработке",
                                        value: OrderStatus.PENDING,
                                    },
                                    {
                                        label: "Запрос на возврат",
                                        value: OrderStatus.RETURN_REQUESTED,
                                    },
                                    {
                                        label: "Возвращено",
                                        value: OrderStatus.RETURNED,
                                    },
                                    {
                                        label: "Завершен",
                                        value: OrderStatus.COMPLETE,
                                    },
                                    {
                                        label: "Отменен",
                                        value: OrderStatus.CANCELLED,
                                    },
                                    {
                                        label: "Использован",
                                        value: OrderStatus.USED,
                                    },
                                ]}
                                value={orderStatus}
                                onChange={(value) => value && setOrderStatus(value as OrderStatus)}
                                //TODO make error handler
                            />
                            <Button
                                loading={isPending}
                                leftIcon={<IconCheck />}
                                onClick={() =>
                                    startTransition(async () => {
                                        const res = await mutations.setOrderStatus({
                                            id: order.id,
                                            status: orderStatus,
                                        })
                                        if (res.success) {
                                            setOrderStatus(res.data)
                                            setEditOrderStatus(false)
                                            setSetStatusError("")
                                        } else {
                                            setEditSendTicketError(res.errors?.server?.join(", ") ?? "")
                                        }
                                    })
                                }
                            >
                                Сохранить
                            </Button>
                        </Group>
                    )}
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
                        {(order.paymentData as PaymentData).social && (
                            <Link target="_blank" href={(order.paymentData as PaymentData).social}>
                                {(order.paymentData as PaymentData).social}
                            </Link>
                        )}
                        {!(order.paymentData as PaymentData).social && <Text>Нет</Text>}
                    </Group>
                    {order.venue?.noSeats === false && (
                        <>
                            <Group sx={{ alignItems: "flex-start" }}>
                                <Text className={classes.header}>Места:</Text>
                                <List type="ordered">
                                    {order.tickets.map((ticket) => (
                                        <List.Item key={ticket.id}>
                                            <Group align="flex-start">
                                                <Text>
                                                    Ряд: {ticket.rowNumber} Место: {ticket.number}
                                                </Text>
                                                <Text>
                                                    {order.isGoodness
                                                        ? `${ticket.priceRange?.price.toFixed(2)} (${Number(
                                                              process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0
                                                          ).toFixed(2)})`
                                                        : ticket.priceRange?.price.toFixed(2)}{" "}
                                                    р.
                                                </Text>
                                                <DashboardOrderFormTicketDeleteButton
                                                    ticketId={ticket.id}
                                                    removeTicket={mutations.removeTicket}
                                                />
                                            </Group>
                                        </List.Item>
                                    ))}
                                </List>
                            </Group>

                            <Button
                                loading={isPending}
                                onClick={() => {
                                    setShowTicketForm(false)
                                    setShowTicketPicker(true)
                                }}
                            >
                                Добавить места
                            </Button>
                        </>
                    )}

                    {showTicketPicker && order.venue && (
                        <Modal opened onClose={() => setShowTicketPicker(false)} title="Выберите места" centered size="auto">
                            <TicketsPicker
                                venue={order.venue}
                                rows={rows}
                                reservedTickets={Array.isArray(reservedTickets) ? reservedTickets : []}
                                onSubmit={(tickets) => {
                                    setShowTicketPicker(false)
                                    startTransition(async () => {
                                        await mutations.addTickets({
                                            orderId: order.id,
                                            tickets: [...tickets.values()].map((ticket) => ticket.id),
                                        })
                                        router.refresh()
                                    })
                                }}
                            />
                        </Modal>
                    )}

                    {order.venue?.noSeats === true && (
                        <>
                            <Text>Количество мест: {order.ticketCount}</Text>
                            <Button
                                loading={isPending}
                                onClick={() => {
                                    setShowTicketPicker(false)
                                    setShowTicketForm(true)
                                }}
                            >
                                Изменить места
                            </Button>
                        </>
                    )}

                    {showTicketForm && order.venue && (
                        <Modal
                            opened
                            onClose={() => setShowTicketForm(false)}
                            title="Выберите места"
                            centered
                            size="auto"
                        >
                            <TicketsForm
                                venue={order.venue}
                                reservedTicketCount={typeof reservedTickets === "number" ? reservedTickets : 0}
                                onSubmit={(ticketCount) => {
                                    setShowTicketForm(false)
                                    startTransition(async () => {
                                        await mutations.setNoSeatTickets({
                                            orderId: order.id,
                                            ticketCount,
                                        })
                                        router.refresh()
                                    })
                                }}
                            />
                        </Modal>
                    )}

                    {!!order.comment.length && (
                        <Group>
                            <Text>Комментарий пользователя:</Text>
                            <Text>{order.comment}</Text>
                        </Group>
                    )}
                    <Stack>
                        <Textarea
                            label="Заметки"
                            value={notes}
                            onChange={(e) => {
                                setNotesError("")
                                setNotes(e.target.value)
                            }}
                        />
                        <Button
                            sx={{ maxWidth: 200 }}
                            variant="default"
                            loading={isPending}
                            onClick={() =>
                                startTransition(async () => {
                                    const res = await mutations.setOrderNotes({
                                        id: order.id,
                                        notes,
                                    })
                                    if (res.success) {
                                        setNotesError("")
                                    } else {
                                        setNotesError(res.errors?.server?.join(", ") ?? "")
                                    }
                                })
                            }
                        >
                            Сохранить
                        </Button>
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
                        <Button leftIcon={<IconDownload />} component="a" href={"/api/getTicket/" + order.id}>
                            Скачать билеты
                        </Button>
                    </Group>
                    <Group>
                        <Text color={order.sentTickets ? "green" : "red"}>
                            {order.sentTickets ? "Билеты отправлены" : "Билеты не отправлены"}
                        </Text>
                        <Button
                            leftIcon={<IconMailForward />}
                            loading={isPending}
                            onClick={() =>
                                startTransition(async () => {
                                    const res = await mutations.sendTickets(order.id)
                                    if (res.success) {
                                        router.refresh()
                                    } else {
                                        setEditSendTicketError(res.errors?.server?.join(", ") ?? "")
                                    }
                                })
                            }
                        >
                            Отправить билеты
                        </Button>
                        <Input.Error>{editSendTicketError}</Input.Error>
                    </Group>
                </Stack>
            </Paper>
            {order.cheque && (
                <Container sx={{ marginTop: 10 }}>
                    <iframe src={"/api/view/" + order.cheque?.id} width="100%" height={800} />
                </Container>
            )}
        </>
    )
}
