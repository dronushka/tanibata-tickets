import { Box, Button, Flex, Loader, Stack, Text } from "@mantine/core"
import { PriceRange, Ticket, Venue } from "@prisma/client"
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react"
import { ClientOrder, TicketRow } from "../useOrder"
import Hall from "./Hall"
import Stage from "./Stage"
import Summary from "./Summary"

export type ClientTicket = Ticket & { priceRange: PriceRange | null }
export type ClientTicketSetter = Dispatch<SetStateAction<Map<number, ClientTicket>>>

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

export default function TicketsPicker({ venue, rows, reservedTickets, order, prevStage, nextStage }:
    {
        venue: (Omit<Venue, "start"> & { start: string }),
        rows: TicketRow[],
        reservedTickets: number[],
        order: ClientOrder,
        prevStage: () => void,
        nextStage: (order: ClientOrder) => void
    }
) {

    const [selectedTickets, setSelectedTickets] = useState<Map<number, ClientTicket>>(new Map)
    if (reservedTickets.length >= venue.ticketCount)
        return (
            <Flex sx={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Text>К сожалению все билеты распроданы...</Text>
            </Flex>
        )
    return (
        <TicketContext.Provider value={{ selectedTickets, setSelectedTickets }}>
            <Stack>
                <Flex sx={{
                    flexDirection: "row"
                }}>
                    <Box>
                        <Stage />
                        <Hall rows={rows} reserved={reservedTickets} />
                    </Box>

                    <Flex sx={{
                        alignItems: "center",
                        padding: 20
                    }}>
                        <Summary order={order} onSubmit={nextStage} />
                    </Flex>
                </Flex>
                <Flex>
                    <Button variant="default" onClick={prevStage}>Назад</Button>
                </Flex>
            </Stack>
        </TicketContext.Provider>
    )
}