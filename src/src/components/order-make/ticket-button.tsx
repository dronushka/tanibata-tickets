import { Button, MantineColor, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Dispatch, SetStateAction } from "react"
import { ClientTicket } from "./use-order"

export default function TicketButton(
    {
        ticket,
        selected = false,
        reserved = false,
        setSelectedTickets,
        sx
    }:
        {
            ticket: ClientTicket,
            setSelectedTickets: Dispatch<SetStateAction<Map<number, ClientTicket>>>,
            selected: boolean,
            reserved?: boolean,
            sx: Sx
        }
) {
    const [opened, { close, open }] = useDisclosure(false)

    const onTicketClick = () => {
        setSelectedTickets(prev => {
            if (prev.has(ticket.id)) {
                const newTickets = new Map(prev)
                newTickets.delete(ticket.id)
                return newTickets
            } else {
                return new Map(prev).set(ticket.id, ticket)
            }
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

    return (
        <Popover width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button
                    disabled={reserved || ticket.reserved}
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