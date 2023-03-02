"use client"

import { useEffect, useState } from "react"
import { File, Order, PriceRange, Row, Ticket } from "@prisma/client"
import { ActionIcon, Button, Group, List, LoadingOverlay, Pagination, Paper, Progress, Stack, Text, TextInput } from "@mantine/core"
import { IconEdit, IconSearch, IconX } from "@tabler/icons-react"
import OrderStatusText from "../orders/client/order-status-text"
import { OrderStatus, PaymentData } from "@/types/types"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import OrdersStatusFilter from "./orders-status-filter"
// import { events} from "next/router"
type DashboardOrder = Omit<Order, "createdAt"> & {
    createdAt: string,
    paymentData: PaymentData,
    cheque: File | null,
    tickets: (Ticket & {
        row: Row,
        priceRange: PriceRange
    })[]
}

export default function DashboardOrders(
    { initOrders, pagination, filter, category }:
        {
            initOrders: DashboardOrder[],
            pagination: {
                page: number,
                pageCount: number
            },
            filter: string,
            category: string
        }
) {
    const [loading, setLoading] = useState(true)

    const [orders, setOrders] = useState(initOrders)

    const [showDates, setShowDates] = useState(false)

    const getLocalDate = (strDate: string) => {
        console.log(strDate)
        return new Date(strDate).toLocaleString('ru-RU')
    }

    useEffect(() => {
        setOrders(initOrders.map(order => ({ ...order, createdAt: getLocalDate(order.createdAt) })))
        setShowDates(true)
    }, [initOrders])

    const router = useRouter()

    const searchParams = useSearchParams()

    useEffect(() => {
        setLoading(false)
    }, [searchParams])

    const [searchFilter, setSearchFilter] = useState(filter)
    const [filterCategory, setFilterCategory] = useState(category)

    const pathname = usePathname()

    const updatePageParams = ({ newPage, newFilter, newCategory }: { newPage?: number, newFilter?: string, newCategory?: string }) => {
        const params = { //page defaults
            page: pagination.page,
            filter,
            category
        }

        if (newFilter || newCategory)
            params.page = 1
        else if (newPage)
            params.page = newPage

        if (newFilter)
            params.filter = newFilter

        if (newCategory)
            params.category = newCategory

        if (params.page === pagination.page && params.filter === filter && params.category === category)
            return

        const url = pathname + "?" + Object.entries(params).map(([key, value]) => value && key + "=" + value).join("&")
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
                            value={searchFilter}
                            // onChange={e => setSearchFilter(e.target.value)}
                            onChange={e => setSearchFilter(e.target.value)}
                            rightSection={
                                <ActionIcon
                                    onClick={() => {
                                        setSearchFilter("")
                                        updatePageParams({ newFilter: "" })
                                        // router.push("/dashboard/orders?page=1" + (searchFilter ? `&filter=${searchFilter}` : "") + (category ? `&category=${filterCategory}` : ""))
                                    }}
                                >
                                    <IconX />
                                </ActionIcon>
                            }
                        />
                        <Button
                            // sx={{ flexBasis: 100 }}
                            leftIcon={<IconSearch />}
                            // onClick={() => router.push("/dashboard/orders?page=1" + (searchFilter ? `&filter=${searchFilter}` : "") + (category ? `&category=${filterCategory}` : ""))}
                            onClick={() => updatePageParams({ newFilter: searchFilter })}
                        >
                            Найти
                        </Button>
                    </Group>
                    <OrdersStatusFilter
                        value={filterCategory}
                        onChange={(value) => {
                            setFilterCategory(value)
                            updatePageParams({ newCategory: value })
                            // setLoading(true)
                            // router.push("/dashboard/orders?page=1" + (searchFilter ? `&filter=${searchFilter}` : "") + "&category=" + value)
                        }}
                    />
                </Stack>
            </Paper>

            {loading && <Progress radius="xs" size="sm" value={100} animate />}

            <Stack sx={{ maxWidth: 500 }}>
                {orders?.map(order => <Paper key={order.id} p="sm" shadow="xs">
                    <Group sx={{ alignItems: "flex-start" }}>
                        <Stack sx={{ flexGrow: 1 }}>
                            <Group sx={{ justifyContent: "space-between" }}>
                                <Group>
                                    <Text>ID: {order.id}</Text>
                                    <Text>{order.tickets.reduce((sum, t) => sum += t.priceRange.price, 0).toFixed(2)} р.</Text>
                                    {/* <Text>Статус: </Text> */}
                                    {!order.cheque && <Text color="red">Заказ не оплачен</Text>}
                                    {order.cheque && <OrderStatusText status={order.status as OrderStatus} />}
                                </Group>
                            </Group>

                            {/* <Text>Константиновский Константин Константинович</Text> */}
                            <Text>{order.paymentData.name}</Text>
                            <Text>{order.paymentData.email}</Text>
                            <Text>{order.createdAt}</Text>

                            {/* <Text>Места:</Text> */}
                            <List type="ordered">
                                {order.tickets.map(ticket => (
                                    <List.Item key={ticket.id} >
                                        <Group>
                                            <Text>Ряд: {ticket.row.number} Место: {ticket.number}</Text>
                                            <Text>{ticket.priceRange.price.toFixed(2)} р.</Text>
                                        </Group>
                                    </List.Item>
                                ))}
                            </List>
                        </Stack>
                        <Link href={"/dashboard/orders/" + order.id} passHref legacyBehavior>
                            <Button component="a" variant="subtle" leftIcon={<IconEdit />}>Изменить</Button>
                        </Link>
                    </Group>
                </Paper>)}
            </Stack>
            <Pagination
                page={pagination.page}
                total={pagination.pageCount}
                withEdges
                // onChange={(page) => router.push("/dashboard/orders?page=" + page + (searchFilter ? `&filter=${searchFilter}` : "") + (category ? `&category=${filterCategory}` : ""))}
                onChange={(page) => updatePageParams({ newPage: page })}
            />
        </Stack>
    )
}