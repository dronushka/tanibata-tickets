"use client"

import getErrorText from "@/lib/getErrorText"
import { Box, Button, Flex, FocusTrap, Group, Input, List, Paper, Stack, Text, TextInput, ThemeIcon } from "@mantine/core"
import { Order, OrderStatus, Ticket, User, Venue } from "@prisma/client"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import FullAreaLoading from "../FullAreaLoading"
import FullAreaMessage from "../FullAreaMessage"
import OrderStatusText from "../../app/orders/components/OrderStatusText"
import { ServerAction } from "@/types/types"

type RestOrder =
    | (Omit<Order, "createdAt"> & {
          createdAt: string
          user: Omit<User, "createdAt"> & { createdAt: string }
          venue: Omit<Venue, "start"> & { start: string }
          tickets: Ticket[]
      })
    | null

export default function TicketScanner({ setOrderStatus }: { setOrderStatus: ServerAction }) {
    const [isPending, startTransition] = useTransition()

    const [code, setCode] = useState("")
    const [codeError, setCodeError] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [order, setOrder] = useState<RestOrder>(null)

    const getOrderByCode = async () => {
        setShowSuccess(false)
        setCodeError("")
        setOrder(null)

        startTransition(async () => {
            try {
                const parsed = JSON.parse(code)
                setCode("")

                const res = await fetch("/api/getOrder?" + new URLSearchParams(parsed), {
                    method: "GET",
                    cache: "no-store"
                })

                if (res.ok) setOrder((await res.json()) as RestOrder)
                else setCodeError((await res.json()).error)
            } catch (e: any) {
                console.error(e)
                setCodeError("json_parse_error")
            }
        })
    }

    const setStatus = async (orderId: number, status: OrderStatus) => {
        startTransition(async () => {
            const res = await setOrderStatus({
                id: orderId,
                status: status,
            })

            if (res.success && order !== null) {
                setOrder({
                    ...order,
                    status: res.data
                })
                setShowSuccess(true)


            } else {
                setCodeError(res.errors?.server?.join(', ') ?? "")
            }
        })
    }

    return (
        <Flex
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            <Stack sx={{ width: "100%" }}>
                <FocusTrap active>
                    <TextInput
                        autoFocus
                        // disabled={loading}
                        label="Код"
                        name="codeInput"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyUp={(e) => e.key === "Enter" && getOrderByCode()}
                        onBlur={(e) => e.target.focus()}
                    />
                </FocusTrap>
                {isPending && <FullAreaLoading />}
                {showSuccess && (
                    <FullAreaMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                            <ThemeIcon variant="outline" color="green" size="xl" sx={{ border: 0 }}>
                                <IconCheck size={40} />
                            </ThemeIcon>

                            <Text fz="lg">Заказ погашен</Text>
                        </Stack>
                    </FullAreaMessage>
                )}
                {codeError && (
                    <FullAreaMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                            <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                                <IconAlertTriangle size={40} />
                            </ThemeIcon>

                            <Text fz="lg">{getErrorText(codeError)}</Text>
                        </Stack>
                    </FullAreaMessage>
                )}
                {order && (
                    <Paper shadow="sm" p="md">
                        <Group sx={{ justifyContent: "space-between" }}>
                            <Stack>
                                <Group>
                                    <Link target="_blank" href={"/dashboard/orders/" + order.id}>
                                        <Text>
                                            {order.venue.name} Заказ №{order.id}
                                        </Text>
                                    </Link>
                                    <OrderStatusText status={order.status} />
                                </Group>
                                {order.isGoodness && <Text fw="bold">(Билеты добро)</Text>}
                                <Text>{order.user.name}</Text>
                                <Text>{order.user.email}</Text>
                                {order.venue?.noSeats === false && (
                                    <Group sx={{ alignItems: "flex-start" }}>
                                        <Text>Места:</Text>
                                        <List type="ordered">
                                            {order.tickets.map((ticket) => (
                                                <List.Item key={ticket.id}>
                                                    <Group>
                                                        <Text>
                                                            Ряд: {ticket.rowNumber} Место: {ticket.number}
                                                        </Text>
                                                        {/* <Text>{ticket.priceRange?.price.toFixed(2) ?? 0} р.</Text> */}
                                                    </Group>
                                                </List.Item>
                                            ))}
                                        </List>
                                    </Group>
                                )}
                                {order.venue?.noSeats === true && <Text>Количество мест: {order.ticketCount}</Text>}
                            </Stack>
                            <Box>
                                <Button
                                    sx={{ minWidth: 150, minHeight: 150 }}
                                    onClick={() => setStatus(order.id, OrderStatus.USED)}
                                >
                                    Погасить заказ
                                </Button>
                            </Box>
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Flex>
    )
}
