"use client"

import { useEffect, useState } from "react"
import { ActionIcon, Box, Button, Group, Pagination, Paper, Progress, Stack, Text, TextInput } from "@mantine/core"
import { IconEdit, IconSearch, IconX } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import OrdersStatusFilter from "./OrdersStatusFilter"
import { File as DBFile, Order, OrderStatus, SentTicket, Ticket, Venue } from "@prisma/client"
import { PaymentData } from "../MakeOrder/useOrder"
import OrderStatusText from "../orders/client/OrderStatusText"

// import { events} from "next/router"


export default function DashboardOrders(
    { orders, pagination, filter, status }:
        {
            orders: (Omit<Order, "createdAt"> & { 
                venue: Omit<Venue, "start"> & { start: string } | null,
                cheque: DBFile | null,
                createdAt: string,
                tickets: Ticket[],
                sentTickets: boolean
            })[],
            pagination: {
                page: number,
                pageCount: number
            },
            filter?: string,
            status?: OrderStatus
        }
) {
    console.log(orders)
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    const searchParams = useSearchParams()

    useEffect(() => {
        setLoading(false)
    }, [searchParams])

    const [searchFilter, setSearchFilter] = useState(filter)
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL" | undefined>(status)

    const pathname = usePathname()

    const updatePageParams = ({ newPage, newFilter, newStatus }: { newPage?: number, newFilter?: string, newStatus?: OrderStatus | "ALL" }) => {
        const params: {
            page?: number,
            filter?: string,
            status?: OrderStatus | "ALL"
        } = { //page defaults
            page: pagination.page,
            filter,
            status
        }

        console.log(params)
        if (newFilter || newStatus)
            params.page = 1
        else if (newPage)
            params.page = newPage

        if (newFilter !== undefined)
            params.filter = newFilter

        if (newStatus !== undefined)
            params.status = newStatus

        if (params.page === pagination.page && params.filter === filter && params.status === status)
            return

        const url = pathname + "?" 
        + Object.entries(params).filter(([key, value]) => !!value).map(([key, value]) => value && key + "=" + value).join("&")
        setLoading(true)
        router.push(url)

    }

    return (

        <Stack>
            <Paper p="sm" shadow="xs">
                <Stack>
                    <Group>
                        <Text>Поиск</Text>
                        <TextInput
                            sx={{ flexBasis: 200, flexGrow: 1 }}
                            value={searchFilter ?? ""}
                            onChange={e => setSearchFilter(e.target.value)}
                            rightSection={
                                <ActionIcon
                                    onClick={() => {
                                        setSearchFilter("")
                                        updatePageParams({ newFilter: "" })
                                    }}
                                >
                                    <IconX />
                                </ActionIcon>
                            }
                        />
                        <Button
                            leftIcon={<IconSearch />}
                            onClick={() => updatePageParams({ newFilter: searchFilter })}
                        >
                            Найти
                        </Button>
                    </Group>
                    <OrdersStatusFilter
                        status={filterStatus || "ALL"}
                        onChange={(value) => {
                            setFilterStatus(value)
                            updatePageParams({ newStatus: value })
                        }}
                    />
                </Stack>
            </Paper>

            {loading && <Progress radius="xs" size="sm" value={100} animate />}

            <Stack>
                {orders.map(order => <Paper key={order.id} p="sm" shadow="xs">
                    <Group sx={{ alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                        <Stack sx={{ flexGrow: 1 }}>
                            <Text fw="bold">{order.venue?.name}</Text>
                            <Group spacing={5}>
                                <Text>Заказ № {order.id}</Text>
                                <Text>от {order.createdAt},</Text>
                                <Text>на сумму {order.price.toFixed(2)} р.</Text>

                            </Group>

                            <Group>
                                <Text>{(order.paymentData as PaymentData).name}</Text>
                                <Text>{(order.paymentData as PaymentData).email}</Text>
                            </Group>
                        </Stack>
                        <Stack sx={{ alignItems: "center" }}>
                            {/* {!order.cheque && <Text color="red">Заказ не оплачен</Text>} */}
                            <OrderStatusText status={order.status} />
                            {order.status !== OrderStatus.UNPAID && !order.cheque && <Text color="red">Чек не найден</Text>} 
                            <Box sx={{ flexShrink: 1 }}>
                                <Link href={"/dashboard/orders/" + order.id} passHref legacyBehavior>
                                    <Button component="a" variant="subtle" leftIcon={<IconEdit />}>Изменить</Button>
                                </Link>
                            </Box>
                        </Stack>
                    </Group>
                </Paper>)}
            </Stack>
            <Pagination
                page={pagination.page}
                total={pagination.pageCount}
                withEdges
                onChange={(page) => updatePageParams({ newPage: page })}
            />
        </Stack>
    )
}