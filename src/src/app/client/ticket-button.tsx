'use client'

import { Button, Popover, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Row, Ticket } from "@prisma/client"
import { MouseEventHandler } from "react"

export default function TicketButton(
    { row, ticket, onClick }: 
    { row: Row, ticket: Ticket, onClick?: MouseEventHandler<HTMLButtonElement> | undefined}
) {
    const [opened, { close, open }] = useDisclosure(false)

    return (
        <Popover key={ticket.id} width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button 
                    color="green"
                    compact
                    sx={{height: 26, width: 26}}  
                    onMouseEnter={open} 
                    onMouseLeave={close}
                    onClick={onClick}
                />
            </Popover.Target>
            <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                <Stack>
                    <Text size="sm">Ряд: {row.number}</Text>
                    <Text size="sm">Место: {ticket.number}</Text>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}