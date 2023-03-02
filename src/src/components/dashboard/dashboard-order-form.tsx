"use client"

import { DashboardOrder, OrderStatus } from "@/types/types"
import { Group, List, Paper, Stack, Text } from "@mantine/core"
import OrderStatusText from "@/components/orders/client/order-status-text"

export default function DashboardOrderForm({ order }: { order: DashboardOrder }) {
    console.log(order)
    return (
        <Paper p="sm" shadow="xs">
            <Stack>
                <Text>Номер заказа: {order.id}</Text>
                <Text>{order.price.toFixed(2)} р.</Text>
                {!order.cheque && <Text color="red">Заказ не оплачен</Text>}
                {order.cheque && <OrderStatusText status={order.status as OrderStatus} />}
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
        </Paper>
    )
}