import { Button, Container, Flex, Group, Paper, Stack, Text, TextInput } from "@mantine/core"
import { Venue } from "@prisma/client"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { ClientOrder, TicketRow } from "./useOrder"

export default function TicketsForm(
    { venue, order, prevStage, nextStage }:
        { 
            venue: (Omit<Venue, "start"> & { start: string, rows: TicketRow[], reservedTickets: number[] }),
            order: ClientOrder,
            prevStage: () => void,
            nextStage: (order: ClientOrder) => void 
        }
) {
    // const { prevStage, nextStage } = useOrder()
    const totalTickets = venue.rows.reduce((sum, row) => sum += row.tickets.length, 0)
    // console.log({totalTickets, reserved: venue.reservedTickets.length})
    const [ticketCount, setTicketCount] = useState(1)

    const setCount = (count: number) => {
        let newTicketCount = ticketCount + count
        if (newTicketCount > totalTickets - venue.reservedTickets.length)
            newTicketCount = totalTickets - venue.reservedTickets.length
        if (newTicketCount < 1)
            newTicketCount = 1
        setTicketCount(newTicketCount)
    }

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Stack>
                <Paper shadow="md" p="md">
                    <Stack>
                        <Text>Укажите количество билетов</Text>
                        <Group position="center">
                            <Text>{ticketCount}</Text>
                            <Stack spacing="xs">
                                <Button p={1} leftIcon={<IconPlus />} onClick={() => setCount(1)}></Button>
                                <Button p={1} leftIcon={<IconMinus />} onClick={() => setCount(-1)}></Button>
                            </Stack>
                        </Group>

                    </Stack>
                </Paper>
                <Group position="center">
                    <Button variant="default" onClick={prevStage}>Назад</Button>
                    <Button onClick={() => nextStage({...order, ticketsCount: ticketCount})}>Далее</Button>
                </Group>
            </Stack>
        </Flex>
    )
}