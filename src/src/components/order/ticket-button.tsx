'use client'

import { ClientTicket } from "@/types"
import { Button, MantineColor, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { MouseEventHandler } from "react"

export default function TicketButton(
    { ticket, selected = false, setOrder, sx }:
        { ticket: ClientTicket, setOrder: any, selected: boolean, sx: Sx }
) {
    const [opened, { close, open }] = useDisclosure(false)
    // console.log('rerender ', rowNumber, ' - ', ticketNumber)

    const onTicketClick = () => {
        setOrder((prev: { tickets: Map<number, ClientTicket> }) => {
            if (prev.tickets.has(ticket.id)) {
                // const { [ticket.id]: remove, ...newTickets } = prev.tickets
                // return { ...prev, tickets: newTickets }
                const newTickets = new Map(prev.tickets)
                newTickets.delete(ticket.id)
                return { ...prev, tickets: newTickets }
            } else {
                return { ...prev, tickets: new Map(prev.tickets).set(ticket.id, ticket)}
            }
                // return { ...prev, tickets: { ...prev.tickets, [ticket.id]: ticket } }
        })
    }

    let colorCode: MantineColor = "gray"

    if (selected)
        colorCode = "yellow"
    else if (ticket.priceRange.id === 1)
        colorCode = "green"
    else if (ticket.priceRange.id === 2)
        colorCode = "violet"
    else if (ticket.priceRange.id === 3)
        colorCode = "pink"

    // console.log(sx, {
    //     ...sx,
    //     backgroundColor: colorCode
    // })
    return (
        <Popover width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button
                    disabled={ticket.reserved}
                    compact
                    sx={{
                        ...sx,
                        backgroundColor: colorCode
                    }}
                    onMouseEnter={open}
                    onMouseLeave={close}
                    onClick={onTicketClick}
                >
                </Button>
            </Popover.Target>
            <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                <Stack spacing="xs">
                    <Text size="xs">Ряд: {ticket.rowNumber}</Text>
                    <Text size="xs">Место: {ticket.number}</Text>
                    <Text size="xs">Цена: {ticket.priceRange.price}</Text>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}