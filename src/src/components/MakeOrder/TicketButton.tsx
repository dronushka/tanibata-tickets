import { Button, MantineColor, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { ClientTicket, ClientTicketSetter } from "./TicketsPicker/TicketsPicker"

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
            setSelectedTickets: ClientTicketSetter,
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
                const newTickets = new Map(prev).set(ticket.id, ticket)
                return new Map(
                    [...newTickets.entries()].sort(([k, v], [k2, v2])=> {
                        return (v.rowNumber ? parseInt(v.rowNumber) : 0) - (v2.rowNumber ? parseInt(v2.rowNumber) : 0) || parseInt(v.number) - parseInt(v2.number)
                    })
                )
            }
        })
    }

    let colorCode: MantineColor = "green"

    if (selected)
        colorCode = "#daca55" //"#da7855"
    else if (ticket.priceRange?.color)
        colorCode = ticket.priceRange.color

    return (
        <Popover width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button
                    disabled={reserved || ticket.reserved}
                    compact
                    sx={{
                        ...sx,
                        backgroundColor: colorCode,
                        "&:disabled": {
                            backgroundColor: "#d4d4d4"
                        }
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
                    <Text size="xs">Цена: {ticket.priceRange?.price ?? 0}</Text>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}