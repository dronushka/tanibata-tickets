import { Button, MantineColor, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Order, PriceRange, Row, Ticket } from "@prisma/client"
import { useRouter } from "next/navigation"


export default function DashboardTicketButton({ row, ticket, sx }:
    {
        row: Row,
        ticket: Ticket & {
            priceRange: PriceRange;
            order: (Omit<Order, "createdAt"> & {
                createdAt: string;
            }) | null
        },
        sx: Sx
    }) {

    const router = useRouter()

    const [opened, { close, open }] = useDisclosure(false)

    let colorCode: MantineColor = "gray"

    if (ticket.orderId)
        colorCode = "gray"
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
                    // disabled={!ticket.orderId}
                    compact
                    sx={{
                        ...sx,
                        backgroundColor: colorCode
                    }}
                    onMouseEnter={open}
                    onMouseLeave={close}
                    onClick={() => {
                        if (ticket.orderId)
                            router.push("/dashboard/orders/" + ticket.orderId)
                    }}
                >
                </Button>
            </Popover.Target>
            <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                <Stack spacing="xs">
                    <Text size="xs">Ряд: {row.number}</Text>
                    <Text size="xs">Место: {ticket.number}</Text>
                    <Text size="xs">Цена: {ticket.priceRange.price}</Text>
                    {ticket.orderId && <Text size="xs">Заказ №{ticket.orderId}</Text>}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}