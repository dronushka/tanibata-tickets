"use client"

import { getQROrder, setOrderStatus } from "@/lib/api-calls"
import getErrorText from "@/lib/getErrorText"
import { Box, Button, Flex, FocusTrap, Group, Input, List, Paper, Stack, Text, TextInput, ThemeIcon } from "@mantine/core"
import { Order, OrderStatus, Ticket, User, Venue } from "@prisma/client"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"
import FullAreaLoading from "../FullAreaLoading"
import FullAreaMessage from "../FullAreaMessage"
import OrderStatusText from "../orders/client/OrderStatusText"

type RestOrder = Omit<Order, "createdAt"> & {
    createdAt: string,
    user: Omit<User, "createdAt"> & { createdAt: string },
    venue: Omit<Venue, "start"> & { start: string },
    tickets: Ticket[]
} | null

export default function TicketScanner() {
    const [code, setCode] = useState("")
    const [codeError, setCodeError] = useState("")
    const [loading, setLoading] = useState(false)
    const [statusPending, setStatusPending] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [order, setOrder] = useState<RestOrder>(null)

    const getOrderByCode = async () => {
        setLoading(true)
        setShowSuccess(false)
        setCodeError("")
        setOrder(null)
        try {
            const parsed = JSON.parse(code)
            setCode("")
            const res = await getQROrder(parsed.id, parsed.hash)
            if (res.success)
                setOrder(res.data)
            else
                setCodeError(res.error)
        } catch (e: any) {
            console.error(e)
            setCodeError("json_parse_error")
        }
        setLoading(false)
    }

    const setStatus = async (orderId: number, status: OrderStatus) => {
        setLoading(true)
        setCodeError("")
        setOrder(null)

        const res = await setOrderStatus(orderId, status)
        if (res.success) {
            setShowSuccess(true)
        }
        else
            setCodeError(res.error ?? "")

        setLoading(false)
    }

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            // justifyContent: "center",
            // alignItems: "center"
        }}>
            <Stack sx={{ width: "100%" }}>
                <FocusTrap active >
                    <TextInput
                        autoFocus
                        // disabled={loading}
                        label="Код"
                        name="codeInput"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        onKeyUp={e => (e.key === "Enter") && getOrderByCode()}
                        onBlur={e => e.target.focus()}
                    />
                </FocusTrap>
                {loading && <FullAreaLoading />}
                {showSuccess && <FullAreaMessage>
                    <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                        <ThemeIcon variant="outline" color="green" size="xl" sx={{ border: 0 }}>
                            <IconCheck size={40} />
                        </ThemeIcon>

                        <Text fz="lg">Заказ погашен</Text>
                    </Stack>
                </FullAreaMessage>}
                {codeError && <FullAreaMessage>
                    <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                        <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                            <IconAlertTriangle size={40} />
                        </ThemeIcon>

                        <Text fz="lg">{getErrorText(codeError)}</Text>
                    </Stack>
                </FullAreaMessage>}
                {order && <Paper shadow="sm" p="md">
                    <Group sx={{ justifyContent: "space-between" }}>
                        <Stack>
                            <Group>
                                <Link
                                    target="_blank"
                                    href={"/dashboard/orders/" + order.id}
                                >
                                    <Text>{order.venue.name} Заказ №{order.id}</Text>
                                </Link>
                                <OrderStatusText status={order.status} />
                            </Group>
                            {order.isGoodness && <Text fw="bold">(Билеты добро)</Text>}
                            <Text>{order.user.name}</Text>
                            <Text>{order.user.email}</Text>
                            {order.venue?.noSeats === false && <Group sx={{ alignItems: "flex-start" }}>
                                <Text>Места:</Text>
                                <List type="ordered">
                                    {order.tickets.map(ticket => (
                                        <List.Item key={ticket.id}>
                                            <Group>
                                                <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                                {/* <Text>{ticket.priceRange?.price.toFixed(2) ?? 0} р.</Text> */}
                                            </Group>
                                        </List.Item>
                                    ))}
                                </List>
                            </Group>}
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
                </Paper>}
            </Stack>
        </Flex>
    )
}