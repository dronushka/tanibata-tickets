'use client'

import { ClientOrder } from "@/types"
import { Group, Stack, Text } from "@mantine/core"
import { Row, Ticket, Venue } from "@prisma/client"
import { useState } from "react"
import TicketButton from "./ticket-button"

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: Ticket[] })[] } | null }) {
    const [ order, setOrder ] = useState<ClientOrder>({
        tickets: []
    })
    
    console.log(venue)
    if (!venue)
        return <></>
    return (
        <>
            <Text>{venue.name}</Text>
            <Stack spacing={2}>
                {
                    venue.rows.map(row => (
                        <Group key={row.id} spacing={2} sx={{ flexWrap: "nowrap" }}>
                            {
                                row.tickets.map(ticket => (
                                    <TicketButton
                                        key={ticket.id}
                                        row={row}
                                        ticket={ticket}
                                        onClick={() => {
                                            if (order)
                                                setOrder({
                                                    ...order,
                                                    tickets: [
                                                        ...order.tickets,
                                                        { 
                                                            rowNumber: row.number,
                                                            ticketId: ticket.id
                                                        }
                                                    ] 
                                                })
                                        }}
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