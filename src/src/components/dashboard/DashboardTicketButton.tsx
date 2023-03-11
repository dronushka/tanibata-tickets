import { Button, MantineColor, Popover, Stack, Sx, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Order, PriceRange, Ticket } from "@prisma/client"
import { useRouter } from "next/navigation"


export default function DashboardTicketButton({ ticket, sx }:
    {
        ticket: Ticket & {
            priceRange: PriceRange | null;
            order: (Omit<Order, "createdAt"> & {
                createdAt: string;
            }) | null
        },
        sx: Sx
    }) {

    const router = useRouter()

    const [opened, { close, open }] = useDisclosure(false)

    let colorCode: MantineColor = "#4eadbb"

    if (ticket.orderId)
        colorCode = "gray"
    else if (ticket.priceRange?.color)
        colorCode = ticket.priceRange.color

    return (
        <Popover width={100} position="bottom" withArrow shadow="md" opened={opened}>
            <Popover.Target>
                <Button
                    // disabled={!ticket.orderId}
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
                    onClick={() => {
                        if (ticket.orderId)
                            router.push("/dashboard/orders/" + ticket.orderId)
                    }}
                >
                </Button>
            </Popover.Target>
            <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                <Stack spacing="xs">
                    <Text size="xs">Ряд: {ticket.rowNumber}</Text>
                    <Text size="xs">Место: {ticket.number}</Text>
                    {/* <Text size="xs">Цена: {ticket.priceRange?.price ?? 0}</Text> */}
                    <Text size="xs">Цена: {ticket.order?.isGoodness ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0) : (ticket.priceRange?.price ?? 0)}</Text>
                    {ticket.orderId && <Text size="xs">Заказ №{ticket.orderId}</Text>}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}