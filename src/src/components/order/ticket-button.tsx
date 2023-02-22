'use client'

import { ClientTicket } from "@/types"
import { Button, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { MouseEventHandler } from "react"

export default function TicketButton(
    { ticket, selected = false, setOrder, sx, onClick }: 
    { ticket: ClientTicket, setOrder: any, selected: boolean, sx: Sx, onClick?: MouseEventHandler<HTMLButtonElement> | undefined}
) {
    const [opened, { close, open }] = useDisclosure(false)
    // console.log('rerender ', rowNumber, ' - ', ticketNumber)

    const onTicketClick = () => {
        setOrder((prev: { tickets: ClientTicket[] }) => {
            if (prev.tickets[ticket.id]) {
                const { [ticket.id]: remove, ...newTickets } = prev.tickets
                return { ...prev, tickets: newTickets}
            } else 
                return {...prev, tickets: {...prev.tickets, [ticket.id]: ticket}}
        })
    }
    return (
        <Popover width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button 
                    compact
                    sx={sx}  
                    onMouseEnter={open} 
                    onMouseLeave={close}
                    onClick={onTicketClick}
                >
                    {selected && "S"}
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