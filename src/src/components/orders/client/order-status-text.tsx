import { Group, MantineColor, Text } from "@mantine/core"
import { OrderStatus } from "@prisma/client"

export default function OrderStatusText({ status }: { status: OrderStatus }) {
    let statusText = ""
    let statusColor: MantineColor = ""

    switch (status) {
        case OrderStatus.UNPAID:
            statusText = "Не оплачен"
            statusColor = "red"
            break
        case OrderStatus.PENDING:
            statusText = "В обработке"
            statusColor = "yellow"
            break
        case OrderStatus.COMPLETE:
            statusText = "Завершен"
            statusColor = "green"
            break
        case OrderStatus.RETURN_REQUESTED:
            statusText = "Запрос на возврат"
            statusColor = "red"
            break
        case OrderStatus.RETURNED:
            statusText = "Возвращен"
            statusColor = "blue"
            break
        case OrderStatus.CANCELLED:
            statusText = "Отменен"
            statusColor = "gray"
            break
        case OrderStatus.USED:
            statusText = "Использован"
            statusColor = "gray"
            break
    }

    return <Text color={statusColor}>{statusText}</Text>
}