"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ServerMutation, ServerMutations } from "@/types/types"
import {
    Box,
    Button,
    FileButton,
    Group,
    Input,
    List,
    Paper,
    Stack,
    Text,
} from "@mantine/core"
import OrderStatusText from "./OrderStatusText"
import OrderStatusTooltip from "./OrderStatusTooltip"
import {
    IconDownload,
    IconReceiptRefund,
    IconUpload,
    IconX,
} from "@tabler/icons-react"
import {
    File as DBFile,
    Order,
    OrderStatus,
    PriceRange,
    Ticket,
    Venue,
} from "@prisma/client"

// import { uploadCheque } from "../actions/uploadCheque"

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
    cancelOrder: ServerMutation
    uploadCheque: ServerMutation
}

export default function OrderItem({
    order,
    mutations,
}: {
    order: HydratedOrder
    mutations: Mutations
}) {
    const router = useRouter()

    const [isPending, startTransition] = useTransition()

    const [orderError, setOrderError] = useState("")

    return (
        <Paper
            key={order.id}
            shadow="md"
            p="md"
            sx={{
                maxWidth: 450,
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
                {order.isGoodness && (
                    <Text
                        fw="bold"
                        // sx={{
                        //     backgroundClip: "text",
                        //     backgroundImage: "linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red)",
                        //     color: "transparent"
                        // }}
                    >
                        Добро активировано!
                    </Text>
                )}
                {order.venue?.noSeats === false && (
                    <>
                        <Text>Места:</Text>
                        <List type="ordered">
                            {order.tickets.map((ticket) => (
                                <List.Item key={ticket.id}>
                                    <Group>
                                        {/* <Text>{ticket.venue?.name}</Text> */}
                                        <Text>
                                            Ряд: {ticket.rowNumber} Место:{" "}
                                            {ticket.number}
                                        </Text>
                                        <Text>
                                            {order.isGoodness
                                                ? Number(
                                                      process.env
                                                          .NEXT_PUBLIC_GOODNESS_PRICE ??
                                                          0
                                                  ).toFixed(2)
                                                : ticket.priceRange?.price.toFixed(
                                                      2
                                                  )}{" "}
                                            р.
                                        </Text>
                                    </Group>
                                </List.Item>
                            ))}
                        </List>
                    </>
                )}
                {order.venue?.noSeats === true && (
                    <>
                        <Text>Количество билетов: {order.ticketCount}</Text>
                    </>
                )}
                {!!order.comment.length && (
                    <>
                        <Text>Комментарий:</Text>
                        <Text>{order.comment}</Text>
                    </>
                )}
                <Group>
                    {order.status !== OrderStatus.UNPAID && !order.cheque && (
                        <Text color="red">Чек не найден!</Text>
                    )}
                    {order.status !== OrderStatus.UNPAID && order.cheque && (
                        <a href={"/api/download/" + order.cheque.id}>
                            Чек приложен
                        </a>
                    )}
                </Group>
                {(order.status === OrderStatus.UNPAID ||
                    order.status === OrderStatus.PENDING) && (
                    <Group>
                        <Box>
                            <Text color="gray" size="sm">
                                Файл размером не более 2 Мб,
                            </Text>
                            <Text color="gray" size="sm">
                                Файл формате: jpeg, png, pdf
                            </Text>
                        </Box>
                        <Box>
                            {isPending && (
                                <Button
                                    loading
                                    variant="outline"
                                    leftIcon={<IconUpload />}
                                >
                                    {order.cheque
                                        ? "Приложить другой"
                                        : "Приложить чек"}
                                </Button>
                            )}
                            {!isPending && (
                                <FileButton
                                    onChange={(value) => {
                                        if (!value) return
                                        const form = new FormData()
                                        form.append("orderId", String(order.id))
                                        form.append("cheque", value)

                                        startTransition(() => {
                                            mutations
                                                .uploadCheque(form)
                                                .then((res) => {
                                                    if (res && res?.error) {
                                                        setOrderError(res.error)
                                                    }
                                                    router.refresh()
                                                })
                                        })
                                    }}
                                    accept="image/png,image/jpeg,application/pdf"
                                >
                                    {(props) => (
                                        <Button
                                            {...props}
                                            loading={isPending}
                                            disabled={isPending}
                                            color={
                                                orderError ? "red" : "primary"
                                            }
                                            variant="outline"
                                            leftIcon={<IconUpload />}
                                        >
                                            {order.cheque
                                                ? "Приложить другой"
                                                : "Приложить чек"}
                                        </Button>
                                    )}
                                </FileButton>
                            )}
                        </Box>
                    </Group>
                )}
                <Button
                    leftIcon={<IconDownload />}
                    disabled={
                        order.status !== OrderStatus.COMPLETE &&
                        order.status !== OrderStatus.USED
                    }
                    component="a"
                    href={"/api/getTicketsPDF?orderId=" + order.id}
                >
                    Скачать билеты
                </Button>

                {order.status === OrderStatus.UNPAID && (
                    <Button
                        leftIcon={<IconX />}
                        loading={isPending}
                        disabled={isPending}
                        // onClick={() => setOrderStatus(order.id)}
                        onClick={() => {
                            const form = new FormData()
                            form.append("orderId", String(order.id))

                            startTransition(() => {
                                mutations.cancelOrder(form).then((res) => {
                                    if (res && res?.error) {
                                        setOrderError(res.error)
                                    }
                                    router.refresh()
                                })
                            })
                        }}
                    >
                        Отменить
                    </Button>
                )}
                {order.status !== OrderStatus.UNPAID && (
                    <Button
                        leftIcon={<IconReceiptRefund />}
                        loading={isPending}
                        disabled={
                            isPending ||
                            !order.cheque ||
                            order.status === OrderStatus.RETURN_REQUESTED ||
                            order.status === OrderStatus.RETURNED ||
                            order.status === OrderStatus.USED ||
                            order.status === OrderStatus.CANCELLED
                        }
                        // onClick={() => setReturnConfirmationOrderId(order.id)}
                    >
                        Возврат
                    </Button>
                )}
                <Input.Error>{orderError}</Input.Error>
            </Stack>
        </Paper>
    )
}