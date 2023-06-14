"use client"

import { Box, Flex, Group, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { Order, PriceRange, Ticket, Venue } from "@prisma/client"
import Stage from "../../app/orders/make/components/TicketsPicker/Stage"
import { TicketRow } from "../MakeOrder/useOrder"
import DashboardTicketButton from "./DashboardTicketButton"

export default function DashboardHall({ venue, rows, reservedTickets }:
    {
        venue: (Omit<Venue, "start"> & { start: string, priceRange: PriceRange[] })
        rows: {
            number: string,
            tickets: (Ticket & { priceRange: PriceRange | null, order: (Omit<Order, "createdAt"> & { createdAt: string }) | null })[]
        }[],
        reservedTickets: number[]
    }
) {
    const dimension = 17

    const getRowSx = (rowIndex: Number) => (theme: MantineTheme) => {
        const defaultSx: Sx = { flexDirection: "row", flexWrap: "nowrap", flexGrow: 1, gap: 10 }
        if (rowIndex === 8)
            return { ...defaultSx, marginBottom: dimension }
        return defaultSx
    }

    const getTicketSx = (rowIndex: Number, ticketIndex: Number) => {
        const defaultSx: Sx = { height: dimension, width: dimension, padding: 0 }
        if (rowIndex > 8 && (ticketIndex == 6 || ticketIndex == 20))
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
            <Group>
                {venue.priceRange.map(priceRange => <Group key={priceRange.id}>
                    <Box sx={{ width: 17, height: 17, borderRadius: 4, backgroundColor: priceRange.color ?? "green" }} />
                    <Text fz="sm">{priceRange.name} {priceRange.price.toFixed(2)} р.</Text>
                </Group>)}
                <Group>
                    <Box sx={{ width: 17, height: 17, borderRadius: 4, backgroundColor: "#d4d4d4" }} />
                    <Text fz="sm">Место занято</Text>
                </Group>
                <Group>
                    <Box sx={{ width: 17, height: 17, borderRadius: 4, backgroundColor: "#4eadbb" }} />
                    <Text fz="sm">Не для продажи</Text>
                </Group>
            </Group>
            <Stage />
            <Stack spacing={2} sx={{
                "& > :nth-child(9)": {
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