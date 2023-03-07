import { Box, Button, Flex, Loader, Stack } from "@mantine/core"
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

export default function TicketsPicker({ venue, order, prevStage, nextStage }: 
    { 
        venue: (Omit<Venue, "start"> & { start: string, rows: TicketRow[], reservedTickets: number[] }),
        order: ClientOrder,
        prevStage: () => void,
        nextStage: (order: ClientOrder) => void
    }
    ) {

    const [selectedTickets, setSelectedTickets] = useState<Map<number, ClientTicket>>(new Map)
    
    return (
        <TicketContext.Provider value={{ selectedTickets, setSelectedTickets }}>
            <Stack>
                <Flex sx={{
                    flexDirection: "row"
                }}>
                    <Box>
                        <Stage />
                        <Hall rows={venue.rows} reserved={venue.reservedTickets} />
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