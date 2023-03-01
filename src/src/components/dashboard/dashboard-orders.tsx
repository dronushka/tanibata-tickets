"use client"

import { useEffect, useState } from "react"
import { File, Order, PriceRange, Row, Ticket } from "@prisma/client"
import { ActionIcon, Button, Group, List, Pagination, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconEdit, IconSearch } from "@tabler/icons-react"
import OrderStatusText from "../orders/client/order-status-text"
import { OrderStatus, PaymentData } from "@/types/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import OrdersStatusFilter from "./orders-status-filter"

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
    const [orders, setOrders] = useState(initOrders)

    const [showDates, setShowDates] = useState(false)

    const getLocalDate = (strDate: string) => {
        console.log(strDate)
        return new Date(strDate).toLocaleString('ru-RU')
    }
    
    useEffect(() => {
        setOrders(initOrders.map(order => ({ ...order, createdAt: getLocalDate(order.createdAt)})))
        setShowDates(true)
    }, [initOrders])

    const router = useRouter()

    const [ searchFilter, setSearchFilter ] = useState(filter)
    const [ filterCategory, setFilterCategory ] = useState(category)

    return (
        <Stack>
            <Paper p="sm" shadow="xs">
                <Stack>
                    <Group>
                        <Text>Поиск</Text>
                        <TextInput
                            sx={{ flexBasis: 200, flexGrow: 1 }}
                            value={searchFilter}
                            onChange={e => setSearchFilter(e.target.value)}
                        />
                        <Button
                            // sx={{ flexBasis: 100 }}
                            leftIcon={<IconSearch />}
                            onClick={() => router.push("/dashboard/orders?page=1" + (searchFilter ? `&filter=${searchFilter}` : "") + (category ? `&category=${filterCategory}` : ""))}
                        >
                            Найти
                        </Button>
                    </Group>
                    <OrdersStatusFilter
                        value={filterCategory}
                        onChange={(value) => {
                            setFilterCategory(value)
                            router.push("/dashboard/orders?page=1" + (searchFilter ? `&filter=${searchFilter}` : "") + "&category=" + value)
                        }}
                    />
                </Stack>
            </Paper>
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
                onChange={(page) => router.push("/dashboard/orders?page=" + page + (searchFilter ? `&filter=${searchFilter}` : "") + (category ? `&category=${filterCategory}` : ""))}
            />
        </Stack>
    )
}