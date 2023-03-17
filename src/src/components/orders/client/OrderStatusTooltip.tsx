import { Tooltip } from "@mantine/core"
import { OrderStatus } from "@prisma/client"
import { IconInfoCircle } from "@tabler/icons-react"

export default function OrderStatusTooltip({ status }: { status: OrderStatus }) {
    let tooltipText = ""

    switch (status) {
        case OrderStatus.UNPAID:
            tooltipText = "Необходимо прикрепить чек об оплате в течение суток после создания заказа. \
            Реквизиты для оплаты указаны в разделе \"Помощь\""
            break
        case OrderStatus.PENDING:
            tooltipText = "Ваш заказ получен. В течение 3-х дней билет будет направлен на указанный email"
            break
        case OrderStatus.COMPLETE:
            tooltipText = "Билет направлен на указанный email. Ждём вас на фестивале!"
            break
        case OrderStatus.RETURN_REQUESTED:
            tooltipText = "Запрос на возврат получен. \
            В течение 2-х дней с вами свяжется билетёр фестиваля для уточнения реквизитов \
            для возврата средств либо вы можете прислать их самостоятельно по контактам, \
            указанным в разделе \"Помощь\""
            break
        case OrderStatus.RETURNED:
            tooltipText = "По вашему заказу выполнен возврат средств"
            break
        case OrderStatus.CANCELLED:
            tooltipText = "Заказ был отменён вами или чек об оплате не был прикреплён \
            в течение суток после создания заказа"
            break
        case OrderStatus.USED:
            tooltipText = "Билет был использован для посещения фестиваля"
            break
    }
    return <Tooltip
        label={tooltipText}
        multiline
        width={300}
        events={{ hover: true, focus: true, touch: true }}
    >
        <IconInfoCircle />
    </Tooltip>
}