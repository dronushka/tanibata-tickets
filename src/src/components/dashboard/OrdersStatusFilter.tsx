"use client"

import { Button, Group, Radio, Text } from "@mantine/core"
import { OrderStatus } from "@prisma/client"

export default function OrdersStatusFilter({ status, onChange } : { status: OrderStatus | "ALL", onChange: (value: OrderStatus | "ALL") => void}) { 
    return (
        <Radio.Group
            name="orderStatus"
            value={status}
            onChange={onChange}
        >
            <Radio value="ALL" label={<Text>Все</Text>} />
            <Radio color="red" value={OrderStatus.UNPAID} label={<Text fw="bold" color="red">Не оплачен</Text>} />
            <Radio color="yellow" value={OrderStatus.PENDING} label={<Text fw="bold" color="yellow">В обработке</Text>} />
            <Radio color="pink" value={OrderStatus.RETURN_REQUESTED} label={<Text fw="bold" color="pink">Запрос на возврат</Text>} />
            <Radio color="blue" value={OrderStatus.RETURNED} label={<Text fw="bold" color="blue">Возвращено</Text>} />
            <Radio color="green" value={OrderStatus.COMPLETE} label={<Text fw="bold" color="green">Завершен</Text>} />
            <Radio color="gray" value={OrderStatus.CANCELLED} label={<Text fw="bold" color="gray">Отменен</Text>} />
            <Radio color="gray" value={OrderStatus.USED} label={<Text fw="bold" color="gray">Использован</Text>} />
        </Radio.Group>
    )
}