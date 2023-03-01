import { OrderStatus } from "@/types/types"
import { Group, MantineColor, Text } from "@mantine/core"

export default function OrderStatusText ({status} : {status: OrderStatus}) {
    let statusText = ""
    let statusColor: MantineColor = ""

    switch (status) {
        case "pending":
            statusText = "В обработке"
            statusColor = "yellow"
            break
        case "complete":
            statusText = "Завершен"
            statusColor = "green"
            break
        case "returnRequested":
            statusText = "Запрос на возврат"
            statusColor = "red"
            break
        case "returned":
            statusText = "Возвращен"
            statusColor = "blue"
            break
    }

    return <Text color={statusColor}>{statusText}</Text>
}