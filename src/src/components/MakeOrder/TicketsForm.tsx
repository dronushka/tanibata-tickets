import { Button, Flex, Group, LoadingOverlay, Paper, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { ClientOrder, TicketRow } from "./useOrder"

export default function TicketsForm(
    { venue, reservedTicketCount, order, prevStage, nextStage }:
        {
            venue: (Omit<Venue, "start"> & { start: string }),
            reservedTicketCount: number,
            order: ClientOrder,
            prevStage: () => void,
            nextStage: (order: ClientOrder) => void
        }
) {
    console.log(venue.ticketCount, reservedTicketCount)

    const [ initialUpdate, setInitialUpdate ] = useState<boolean>(true)
    const router = useRouter()
    const [ isPending, startTransition ] = useTransition()

    useEffect(() => {
        router && startTransition(() => router.refresh())
        setInitialUpdate(false)
    }, [router])

    const [ticketCount, setTicketCount] = useState(1)

    const setCount = (count: number) => {
        let newTicketCount = ticketCount + count
        if (newTicketCount > venue.ticketCount - reservedTicketCount)
            newTicketCount = venue.ticketCount - reservedTicketCount
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
            <div style={{ position: 'relative' }}>
                <LoadingOverlay visible={initialUpdate || isPending} overlayBlur={2} />
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
                        <Button onClick={() => nextStage({ ...order, ticketCount })}>Далее</Button>
                    </Group>
                </Stack>
            </div>
        </Flex>
    )
}