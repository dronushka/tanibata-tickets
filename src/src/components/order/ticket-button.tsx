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
        setOrder(prev => {
            console.log(prev)
            return {...prev, tickets: [...prev.tickets, ticket]}
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
                <Stack>
                    <Text size="sm">Ряд: {ticket.rowNumber}</Text>
                    <Text size="sm">Место: {ticket.number}</Text>
                    <Text size="sm">{selected}</Text>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}