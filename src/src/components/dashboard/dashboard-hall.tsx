"use client"

import { Box, Flex, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { Order, PriceRange, Row, Ticket, Venue } from "@prisma/client"
import Stage from "../order-make/tickets-picker/stage"
import DashboardTicketButton from "./dashboard-ticket-button"

export default function DashboardHall({ venue, reserved, total }:
    {
        venue: (Venue & {
            rows: (Row & {
                tickets: (Ticket & {
                    priceRange: PriceRange;
                    order: (Omit<Order, "createdAt"> & { createdAt: string }) | null;
                })[];
            })[];
        }),
        reserved: number,
        total: number
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

    // console.log(venue)
    return (
        <Stack>
            <Text>Заполненность зала: {reserved}/{total} ({((reserved / total) * 100).toFixed(2)}%)</Text>
            <Stage />
            <Stack spacing={2} sx={{
                "& > :nth-child(10)": {
                    marginBottom: dimension,
                }
            }}>
                {venue.rows && venue.rows.map((row, i) => (
                    <Flex key={row.id} sx={getRowSx(i)}>
                        <Text fz="xs" sx={{ flexBasis: 40, whiteSpace: "nowrap" }}>{`Ряд ${row.number}`}</Text>
                        <Flex
                            sx={{ flexGrow: 1, justifyContent: "center", flexWrap: "nowrap", gap: 2 }}
                        >
                            {
                                row.tickets.map((ticket, j) => (
                                    <DashboardTicketButton
                                        key={ticket.id}
                                        sx={getTicketSx(i, j)}
                                        row={row}
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