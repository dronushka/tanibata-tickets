"use client"

import { ClientTicket } from "@/types/types"
import { Button, Divider, Group, Paper, Stack, Text } from "@mantine/core"
import { useContext } from "react"
import { useOrder } from "../use-order"
import { TicketContext } from "./tickets-picker"

export default function Summary() {
    const { order, nextStage } = useOrder() //TODO move out order context from here

    const { selectedTickets, setSelectedTickets } = useContext(TicketContext)

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Text size="sm" fw={700}>Выбрано {order ? `(${order.tickets.size})` : ""}:</Text>
                {[...selectedTickets.values()].map(ticket => (
                    <Group key={ticket.id} sx={{justifyContent: "space-between"}}>
                        <Text size="sm">Ряд: {ticket.rowNumber}, Место: {ticket.number}</Text>
                        <Text size="sm">{ticket.priceRange.price} руб.</Text>
                    </Group>
                ))}
                <Divider/>
                <Group sx={{justifyContent: "space-between"}}>
                    <Text size="sm" fw={700}>Итого:</Text>
                    <Text size="sm" fw={700}>{order && [...order.tickets.values()].reduce((sum: number, ticket: ClientTicket) => sum + ticket.priceRange.price, 0)} руб.</Text>
                </Group>
                <Button 
                    disabled={!selectedTickets.size}
                    onClick={() => nextStage({...order, stage: order?.stage, tickets: selectedTickets})}
                >
                    Перейти к оплате
                </Button>
            </Stack>
        </Paper>
    )
}