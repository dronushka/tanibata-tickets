import { Box, Button, Flex, Group, Paper, Stack, Text, Tooltip } from "@mantine/core"
import { PriceRange, Ticket, Venue } from "@prisma/client"
import { IconInfoCircle } from "@tabler/icons-react"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { ClientOrder } from "../../hooks/useOrder"
import Hall from "./Hall"
import Stage from "./Stage"
import Summary from "./Summary"

export type ClientTicket = Ticket & { priceRange: PriceRange | null }
export type ClientTicketSetter = Dispatch<SetStateAction<Map<number, ClientTicket>>>

export const TicketContext = createContext<{
    selectedTickets: Map<number, ClientTicket>
    setSelectedTickets: Dispatch<SetStateAction<Map<number, ClientTicket>>>
}>({
    selectedTickets: new Map(),
    setSelectedTickets: () => {},
})

export default function TicketsPicker({
    venue,
    rows,
    reservedTickets,
    // prevStage,
    onSubmit,
}: {
    venue: Omit<Venue, "start"> & { start: string; priceRange: PriceRange[] }
    rows: Record<string, (Ticket & { priceRange: PriceRange | null })[]>
    reservedTickets: number[]
    onSubmit: (tickets: Map<number, ClientTicket>) => void
}) {
    const [selectedTickets, setSelectedTickets] = useState<Map<number, ClientTicket>>(new Map())

    if (reservedTickets.length >= venue.ticketCount)
        return (
            <Flex
                sx={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>К сожалению все билеты распроданы...</Text>
            </Flex>
        )
    return (
        <TicketContext.Provider value={{ selectedTickets, setSelectedTickets }}>
            <Stack>
                <Flex
                    sx={{
                        flexDirection: "row",
                    }}
                >
                    <Box>
                        <Stage />
                        <Hall
                            rows={Object.entries(rows).map(([rowNumber, tickets]) => ({ number: rowNumber, tickets }))}
                            reserved={reservedTickets}
                        />
                    </Box>

                    <Flex
                        sx={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            paddingLeft: 20,
                        }}
                    >
                        <Paper shadow="sm" radius="md" p="md" mb="sm" sx={{ width: 250 }}>
                            <Stack spacing="sm">
                                {venue.priceRange.map((priceRange) => (
                                    <Group key={priceRange.id}>
                                        <Box
                                            sx={{
                                                width: 17,
                                                height: 17,
                                                borderRadius: 4,
                                                backgroundColor: priceRange.color ?? "green",
                                            }}
                                        />
                                        <Text fz="sm">
                                            {priceRange.name} {priceRange.price.toFixed(2)} р.
                                        </Text>
                                        <Tooltip
                                            label="Любой билет вы можете сделать Добром на следующем экране"
                                            multiline
                                            width={200}
                                            events={{ hover: true, focus: true, touch: true }}
                                        >
                                            <IconInfoCircle width={17} height={17} />
                                        </Tooltip>
                                    </Group>
                                ))}
                                <Group>
                                    <Box sx={{ width: 17, height: 17, borderRadius: 4, backgroundColor: "#d4d4d4" }} />
                                    <Text fz="sm">Место занято</Text>
                                </Group>
                            </Stack>
                        </Paper>

                        <Summary onSubmit={onSubmit} />
                    </Flex>
                </Flex>

            </Stack>
        </TicketContext.Provider>
    )
}
