import { Button, Flex, Group, Paper, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { ClientOrder } from "../hooks/useOrder"

export default function TicketsForm({
    venue,
    reservedTicketCount,
    onSubmit
}: {
    venue: Omit<Venue, "start"> & { start: string }
    reservedTicketCount: number
    onSubmit: (ticketCount: number) => void

}) {
    const [ticketCount, setTicketCount] = useState(1)

    const setCount = (count: number) => {
        let newTicketCount = ticketCount + count
        if (newTicketCount > venue.ticketCount - reservedTicketCount) newTicketCount = venue.ticketCount - reservedTicketCount
        if (newTicketCount < 1) newTicketCount = 1
        setTicketCount(newTicketCount)
    }

    return (
        <>
            {reservedTicketCount >= venue.ticketCount && <Text>К сожалению все билеты распроданы...</Text>}
            {reservedTicketCount < venue.ticketCount && (
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
                    <Button onClick={() => onSubmit(ticketCount)}>Далее</Button>
                </Stack>
            )}
        </>
    )
}
