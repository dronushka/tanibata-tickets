'use client'

import { memo, useContext, useEffect, useState, useTransition } from "react"
import { Flex, LoadingOverlay, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { TicketContext } from "./TicketsPicker"
import TicketButton from "../TicketButton"
import { useRouter } from "next/navigation"
import { TicketRow } from "../useOrder"

const MemoizedTicketButton = memo(TicketButton, (oldPros, newProps) => {
    return oldPros.selected === newProps.selected && oldPros.reserved === newProps.reserved
})

export default function Hall({ rows = [], reserved = [] }: { rows?: TicketRow[], reserved: number[] }) {
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

    const { selectedTickets, setSelectedTickets } = useContext(TicketContext)

    const dimension = 17

    // console.log({reserved})
    return (

        <Stack spacing={2} sx={{
            "& > :nth-child(9)": {
                marginBottom: dimension,
            }
        }}>
            {
                rows && rows.map((row, i) => (
                    <Flex key={i} sx={getRowSx(i)}>
                        <Text fz="xs" sx={{ flexBasis: 40, whiteSpace: "nowrap" }}>{`Ряд ${row.number}`}</Text>
                        <Flex
                            sx={{ flexGrow: 1, justifyContent: "center", flexWrap: "nowrap", gap: 2 }}
                        >
                            {
                                row.tickets.map((ticket, j) => (
                                    <MemoizedTicketButton
                                        key={ticket.id}
                                        sx={getTicketSx(i, j)}
                                        selected={!!selectedTickets.has(ticket.id)}
                                        reserved={!!reserved.find(id => id === ticket.id)}
                                        ticket={ticket}
                                        setSelectedTickets={setSelectedTickets}
                                    />
                                ))
                            }
                        </Flex>
                    </Flex>
                ))
            }
        </Stack>
    )
}