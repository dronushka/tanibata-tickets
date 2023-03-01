"use client"

import { Button, Group, Radio, Text } from "@mantine/core"

export default function OrdersStatusFilter({ value, onChange } : { value: string, onChange: (value: string) => void}) { //TODO use type for order status
    // return (
    //     // "pending" | "complete" | "returnRequested" | "returned"
    //     <Group>
    //         <Button color="red">Не оплачено</Button>
    //         <Button color="yellow">В обработке</Button>
    //         <Button color="pink">Запрос на возврат</Button>
    //         <Button color="blue">Возвращено</Button>
    //         <Button color="green">Завершен</Button>
    //     </Group>
    // )

    return (
        <Radio.Group
            name="orderStatus"
            value={value}
            onChange={onChange}
            // label="Select your favorite framework/library"
        >
            <Radio value="all" label={<Text>Все</Text>} />
            <Radio color="red" value="unpaid" label={<Text fw="bold" color="red">Не оплачен</Text>} />
            <Radio color="yellow" value="pending" label={<Text fw="bold" color="yellow">В обработке</Text>} />
            <Radio color="pink" value="returnRequested" label={<Text fw="bold" color="pink">Запрос на возврат</Text>} />
            <Radio color="blue" value="returned" label={<Text fw="bold" color="blue">Возвращено</Text>} />
            <Radio color="green" value="complete" label={<Text fw="bold" color="green">Завершен</Text>} />
        </Radio.Group>
    )
}