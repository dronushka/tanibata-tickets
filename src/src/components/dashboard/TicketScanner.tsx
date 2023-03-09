"use client"

import { getQROrder } from "@/lib/api-calls"
import { Flex, FocusTrap, Group, Input, List, Paper, Stack, Text, TextInput } from "@mantine/core"
import { Order, Ticket, User, Venue } from "@prisma/client"
import Link from "next/link"
import { useState } from "react"

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
    const [order, setOrder] = useState<RestOrder>(null)

    const getOrderByCode = async () => {
        setLoading(true)
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
            // if (e instanceof SyntaxError)
                setCodeError("Не удалось считать код")
            
        }
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
                <Input.Error>{codeError}</Input.Error>
                {order && <Paper>
                    <Stack>
                        <Link
                            target="_blank"
                            href={"/dashboard/orders/" + order.id}
                        >
                            <Text>{order.venue.name} Заказ №{order.id}</Text>
                        </Link>
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
                </Paper>}
            </Stack>
        </Flex>
    )
}