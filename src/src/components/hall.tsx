'use client'

import { ClientRow } from "@/types"
import { Group, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { memo, useContext } from "react"
import { OrderContext } from "./order/OrderContext"
import TicketButton from "./order/ticket-button"

const MemoizedTicketButton = memo(TicketButton, (oldPros, newProps) => {
    return oldPros.selected === newProps.selected
})

export default function Hall({ rows = []}: { rows?: ClientRow[] }) {
    const getRowSx = (rowIndex: Number) => (theme: MantineTheme) => {
        const defaultSx: Sx = { flexWrap: "nowrap", justifyContent: "center" }
        if (rowIndex === 9)
            return {...defaultSx, marginBottom: dimension}
        return defaultSx
    }

    const getTicketSx = (rowIndex: Number, ticketIndex: Number) => (theme: MantineTheme) => {
        const defaultSx: Sx = {height: dimension, width: dimension, backgroundColor: theme.colors.green[6]}
        if (rowIndex > 9 && (ticketIndex == 6 || ticketIndex == 20))
            return {...defaultSx, marginRight: dimension}
        return defaultSx
    }

    const { order, setOrder } = useContext(OrderContext)

    const dimension = 26

    // console.log(venue)
    // if (!venue)
    //     return <></>

    console.log(order)
    
    return (
        <>
            <Stack spacing={2}>
                {
                    rows && rows.map((row, i) => (
                        <Group
                            key={row.id}
                            spacing={2}
                            sx={getRowSx(i)}
                        >
                            {
                                row.tickets.map((ticket, j) => (
                                    <MemoizedTicketButton
                                        key={ticket.id}
                                        sx={getTicketSx(i, j)}
                                        selected={!!order?.tickets[ticket.id]}
                                        ticket={ticket}
                                        setOrder={setOrder}
                                    />
                                ))
                            }
                        </Group>
                    ))
                }
            </Stack>
        </>
    )
}