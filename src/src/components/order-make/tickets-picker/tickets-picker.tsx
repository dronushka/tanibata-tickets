import { getReservedTickets } from "@/lib/api-calls"
import { ClientTicket, ClientVenue } from "@/types/types"
import { Box, Button, Flex, Loader } from "@mantine/core"
import { Ticket } from "@prisma/client"
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react"
import { useOrder } from "../use-order"
import Hall from "./hall"
import Stage from "./stage"
import Summary from "./summary"

export const TicketContext = createContext<
    {
        selectedTickets: Map<number, ClientTicket>,
        setSelectedTickets: Dispatch<SetStateAction<Map<number, ClientTicket>>>
    }
>(
    {
        selectedTickets: new Map,
        setSelectedTickets: () => { }
    }
)

export default function TicketsPicker({ venue }: { venue: ClientVenue }) {
    const { order, nextStage, prevStage, setOrder } = useOrder()

    const [selectedTickets, setSelectedTickets] = useState<Map<number, ClientTicket>>(new Map)

    if (!venue)
        return <Loader size="xl" />

    return (
        <TicketContext.Provider value={{ selectedTickets, setSelectedTickets }}>
            <Flex sx={{
                flexDirection: "row"
            }}>
                <Box>
                    <Stage />
                    <Hall rows={venue.rows} />
                </Box>

                <Flex sx={{
                    alignItems: "center",
                    padding: 20
                }}>
                    <Summary />
                </Flex>
            </Flex>
            <Button variant="default" onClick={prevStage}>Назад</Button>
        </TicketContext.Provider>
    )
}