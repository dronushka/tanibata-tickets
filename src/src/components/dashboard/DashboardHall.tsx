"use client"

import { Box, Flex, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { Order, PriceRange, Ticket, Venue } from "@prisma/client"
import Stage from "../MakeOrder/TicketsPicker/Stage"
import { TicketRow } from "../MakeOrder/useOrder"
import DashboardTicketButton from "./DashboardTicketButton"

export default function DashboardHall({ venue, rows, reservedTickets }:
    {
        venue: (Omit<Venue, "start"> & { start: string })
        rows: TicketRow[],
        reservedTickets: number[]
    }
) {
    const dimension = 17

    const getRowSx = (rowIndex: Number) => (theme: MantineTheme) => {
        const defaultSx: Sx = { flexDirection: "row", flexWrap: "nowrap", flexGrow: 1, gap: 10 }
        if (rowIndex === 9)
            return { ...defaultSx, marginBottom: dimension }
        return defaultSx
    }

    const getTicketSx = (rowIndex: Number, ticketIndex: Number) => {
        const defaultSx: Sx = { height: dimension, width: dimension, padding: 0 }
        if (rowIndex > 9 && (ticketIndex == 6 || ticketIndex == 20))
            return { ...defaultSx, marginRight: dimension }
        return defaultSx
    }

    const reserved = reservedTickets.length
    const total = rows.reduce((sum, row) => sum += row.tickets.length, 0)
    // console.log(venue)
    return (
        <Stack>
            <Text fw="bold">{venue.name} {venue.start}</Text>
            <Text>Заполненность зала: {reserved}/{total} ({((reserved / total) * 100).toFixed(2)}%)</Text>
            <Stage />
            <Stack spacing={2} sx={{
                "& > :nth-child(10)": {
                    marginBottom: dimension,
                }
            }}>
                {rows && rows.map((row, i) => (
                    <Flex key={i} sx={getRowSx(i)}>
                        <Text fz="xs" sx={{ flexBasis: 40, whiteSpace: "nowrap" }}>{`Ряд ${row.number}`}</Text>
                        <Flex
                            sx={{ flexGrow: 1, justifyContent: "center", flexWrap: "nowrap", gap: 2 }}
                        >
                            {
                                row.tickets.map((ticket, j) => (
                                    <DashboardTicketButton
                                        key={ticket.id}
                                        sx={getTicketSx(i, j)}
                                        ticket={ticket}
                                    />
                                ))
                            }
                        </Flex>
                    </Flex>
                ))}
            </Stack>
        </Stack>
    )
}