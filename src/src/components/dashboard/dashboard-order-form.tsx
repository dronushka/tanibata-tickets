"use client"

import { DashboardOrder, OrderStatus } from "@/types/types"
import { Button, Group, Input, List, Paper, Select, Stack, Text } from "@mantine/core"
import OrderStatusText from "@/components/orders/client/order-status-text"
import { IconCheck, IconDownload, IconEdit } from "@tabler/icons-react"
import OrderStatusSelect from "./order-status-select"
import { useEffect, useState } from "react"
import { setOrderStatus as apiSetOrderStatus } from "@/lib/api-calls"
export default function DashboardOrderForm({ order }: { order: DashboardOrder }) {
    console.log(order)
    const [ orderStatus, setOrderStatus ] = useState<OrderStatus>(order.status as OrderStatus)
    const [ editOrderStatus, setEditOrderStatus ] = useState(false)
    const [ setStatusError, setSetStatusError ] = useState("")

    const [ loading, setLoading ] = useState(false)

    const sendOrderStatus = async () => {
        setLoading(true)
        const res = await apiSetOrderStatus(order.id, orderStatus)
        if (res.success) {
            setEditOrderStatus(false)
        } else if (res.error) {
            setSetStatusError(res.error)
        }

        setLoading(false)
    }
    // useEffect(() => {
    //     setOrderStatus
    // }, [editOrderStatus])
    return (
        <Paper p="sm" shadow="xs">
            <Stack>
                <Text>Номер заказа: {order.id}</Text>
                <Text>{order.price.toFixed(2)} р.</Text>
                {!editOrderStatus && <Group>
                    {!order.cheque && <Text color="red">Заказ не оплачен</Text>}
                    {order.cheque && <OrderStatusText status={orderStatus} />}
                    <Button leftIcon={<IconEdit />} onClick={() => setEditOrderStatus(true)}>Изменить</Button>
                </Group>}
                {editOrderStatus && <Group>
                    <Select 
                        disabled={loading}
                        data={[
                            {
                                label: "В обработке",
                                value: "pending"
                            },
                            {
                                label: "Запрос на возврат",
                                value: "returnRequested"
                            },
                            {
                                label: "Возвращено",
                                value: "returned"
                            },
                            {
                                label: "Завершен",
                                value: "complete"
                            }
                        ]}                    
                        value={orderStatus}
                        onChange={value => value && setOrderStatus(value as OrderStatus)}
                    />
                    <Button loading={loading} leftIcon={<IconCheck />} onClick={sendOrderStatus}>Сохранить</Button>
                </Group>}
                <Input.Error>{setStatusError}</Input.Error>
                {/* <OrderStatusSelect value={orderStatus} onChange={setOrderStatus}/> */}
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

                {order.cheque && <Button leftIcon={<IconDownload />} component="a" href={"/api/download/" + order.cheque.id}>Скачать чек</Button>}
            </Stack>
        </Paper>
    )
}