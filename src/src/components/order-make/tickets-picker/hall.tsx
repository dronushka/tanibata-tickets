'use client'

import { Ticket } from "@prisma/client"
import { TicketRow, useOrder } from "../use-order"
import { getReservedTickets } from "@/lib/api-calls"
import { TicketContext } from "./tickets-picker"
import { memo, useContext, useEffect, useState } from "react"
import { Group, LoadingOverlay, MantineTheme, Stack, Sx } from "@mantine/core"
import TicketButton from "../ticket-button"

const MemoizedTicketButton = memo(TicketButton, (oldPros, newProps) => {
    return oldPros.selected === newProps.selected && oldPros.reserved === newProps.reserved
})

export default function Hall({ rows = []}: { rows?: TicketRow[] }) {
    const getRowSx = (rowIndex: Number) => (theme: MantineTheme) => {
        const defaultSx: Sx = { flexWrap: "nowrap", justifyContent: "center" }
        if (rowIndex === 9)
            return {...defaultSx, marginBottom: dimension}
        return defaultSx
    }

    const getTicketSx = (rowIndex: Number, ticketIndex: Number) => {
        const defaultSx: Sx = {height: dimension, width: dimension}
        if (rowIndex > 9 && (ticketIndex == 6 || ticketIndex == 20))
            return {...defaultSx, marginRight: dimension}
        return defaultSx
    }

    const [ reservedTickets, setReservedTickets ] = useState<Ticket[]>([])

    const [ loadingTickets, setLoadingTickets ] = useState<boolean>(true)

    const { setOrder } = useOrder() //TODO move out order context from here

    useEffect(() => {
        const fetchReservedTickets = async () => {
            const res = await getReservedTickets()
            if (res.success)
                setReservedTickets(res.data)
            else
                setOrder && setOrder(prev => ({
                    ...prev,
                    stage: "error",
                    error: res.error,
                    tickets: new Map
                }))
            setLoadingTickets(false)
        }

        if (loadingTickets)
            fetchReservedTickets()
    }, [ loadingTickets ])
    

    const { selectedTickets, setSelectedTickets } = useContext(TicketContext)

    const dimension = 20

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={loadingTickets} overlayBlur={2} />
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
                                        selected={!!selectedTickets.has(ticket.id)}
                                        reserved={!!reservedTickets.find(rt => rt.id === ticket.id)}
                                        ticket={ticket}
                                        setSelectedTickets={setSelectedTickets}
                                    />
                                ))
                            }
                        </Group>
                    ))
                }
            </Stack>
        </div>
    )
}