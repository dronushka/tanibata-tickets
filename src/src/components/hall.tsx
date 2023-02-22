'use client'

import { ClientRow, ClientTicket } from "@/types"
import { Group, MantineTheme, Stack, Sx, Text } from "@mantine/core"
import { Row, Ticket, Venue } from "@prisma/client"
import { memo, useCallback, useContext } from "react"
import { OrderContext } from "./order/OrderContext"
import TicketButton from "./order/ticket-button"

const MemoizedTicketButton = memo(TicketButton, (oldPros, newProps) => {
    // debugger
    // console.log('oldProps', oldPros)
    // console.log('newProps', newProps)
    return oldPros.selected === newProps.selected
})

// export default function Hall({ venue }: { venue?: Venue & { rows: (Row & { tickets: SelectableTicket[] })[] } }) {
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

    // const onTicketClick = useCallback((ticket: ClientTicket) => {
    //     if (!order || !setOrder) return
    //     console.log('ticketClick', order, ticket)
    //     setOrder({
    //         ...order,
    //         tickets: [
    //             ...order.tickets,
    //             ticket
    //         ]
    //     })
    // }, [order])

    
    // const onTicketClick = (ticket: ClientTicket) => {
    //     if (!order || !setOrder) return
    //     console.log('ticketClick', order, ticket)

        
    //     setOrder({
    //         ...order,
    //         tickets: [
    //             ...order.tickets,
    //             ticket
    //         ]
    //     })
    // }

    const dimension = 26

    // console.log(venue)
    // if (!venue)
    //     return <></>

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
                                        // rowNumber={String(ticket.rowNumber)}
                                        // ticketNumber={ticket.number}
                                        selected={!!order?.tickets.find(orderTicket => orderTicket.id === ticket.id)}
                                        // row={row}
                                        ticket={ticket}
                                        setOrder={setOrder}
                                        // onClick={() => onTicketClick(ticket)}
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