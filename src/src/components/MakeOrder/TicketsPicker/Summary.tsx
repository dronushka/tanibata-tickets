"use client"

import { Button, Divider, Group, Paper, Stack, Text } from "@mantine/core"
import { useContext } from "react"
import { ClientOrder } from "../useOrder"
import { ClientTicket, TicketContext } from "./TicketsPicker"

export default function Summary({ order, onSubmit }:
    {
        order: ClientOrder,
        onSubmit: (order: ClientOrder) => void
    }
) {
    const { selectedTickets } = useContext(TicketContext)

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Text size="sm" fw={700}>Выбрано {selectedTickets.size ? `(${selectedTickets.size})` : ""}:</Text>
                {[...selectedTickets.values()].map(ticket => (
                    <Group key={ticket.id} sx={{justifyContent: "space-between"}}>
                        <Text size="sm">Ряд: {ticket.rowNumber}, Место: {ticket.number}</Text>
                        <Text size="sm">{ticket.priceRange?.price} руб.</Text>
                    </Group>
                ))}
                <Divider/>
                <Group sx={{justifyContent: "space-between"}}>
                    <Text size="sm" fw={700}>Итого:</Text>
                    <Text size="sm" fw={700}>{[...selectedTickets.values()].reduce((sum: number, ticket: ClientTicket) => sum + (ticket.priceRange?.price ?? 0), 0)} руб.</Text>
                </Group>
                <Button 
                    disabled={!selectedTickets.size}
                    onClick={() => order && onSubmit({...order, tickets: selectedTickets, ticketCount: selectedTickets.size})}
                >
                    Перейти к оплате
                </Button>
            </Stack>
        </Paper>
    )
}