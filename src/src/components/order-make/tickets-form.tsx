import { Button, Container, Flex, Group, Paper, Stack, Text, TextInput } from "@mantine/core"
import { Venue } from "@prisma/client"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { TicketRow, useOrder } from "./use-order"

export default function TicketsForm(
    { venue }:
        { venue: (Omit<Venue, "start"> & { start: string, rows: TicketRow[] }) | null }
) {
    const { prevStage, nextStage } = useOrder()

    const [ticketCount, setTicketCount] = useState(1)

    const setCount = (count: number) => {
        setTicketCount(ticketCount + count >= 1 ? ticketCount + count : 1)
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
                    <Button>Далее</Button>
                </Group>
            </Stack>
        </Flex>
    )
}