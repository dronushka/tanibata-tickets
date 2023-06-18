import { getReservedTickets } from "@/lib/api-calls"
import { Button, Flex, Group, LoadingOverlay, Paper, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { ClientOrder, TicketRow } from "../hooks/useOrder"

export default function TicketsForm(
    { venue, reservedTicketCount, prevStage, nextStage }:
        {
            venue: (Omit<Venue, "start"> & { start: string }),
            reservedTicketCount: number,
            prevStage: () => void,
            nextStage: (order: (prev: ClientOrder) => ClientOrder) => void
        }
) {
    const [ isPending, startTransition ] = useTransition()
    const router = useRouter()

    // const [reservedTicketCount, setReservedTicketsCount] = useState<number>(0)
    // const [loading, setLoading] = useState(true)
    const [networkError, setNetworkError] = useState("")

    useEffect(() => {
        startTransition(() => router.refresh())
    }, [venue.id])

    // useEffect(() => {
    //     const fetch = async () => {
    //         setLoading(true)

    //         const res = await getReservedTickets(venue.id)

    //         if (res.success)
    //             setReservedTicketsCount(res.data.reservedTicketCount)
    //         else
    //             setNetworkError(res.error ?? "")

    //         setLoading(false)
    //     }
    //     fetch()
    // }, [venue.id])

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
                <LoadingOverlay visible={isPending} overlayBlur={2} />
                {reservedTicketCount >= venue.ticketCount && <Text>К сожалению все билеты распроданы...</Text>}
                {(reservedTicketCount < venue.ticketCount) && <Stack>
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
                        <Button onClick={() => nextStage(order => ({ ...order, ticketCount }))}>Далее</Button>
                    </Group>
                </Stack>}
            </div>
        </Flex>
    )
}