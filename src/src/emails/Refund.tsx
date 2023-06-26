import * as React from "react"
import { Html } from "@react-email/html"
import EmailSignature from "./EmailSignature"
import { Tailwind } from "@react-email/tailwind"
import { Body } from "@react-email/body"

export default function Refund() {
    return (
        <Html>
            <Tailwind>
                <Body className="bg-white">
                    <p style={{ textAlign: "center" }}>Уважаемый зритель!</p>
                    <p>Сожалеем, что досадные обстоятельства помешали Вашему посещению Танибата 2023.</p>
                    <p>
                        Теперь хорошие новости: отмена Вашего заказа билетов успешно произведена. Стоимость билетов будет
                        возвращена Вам на банковскую карту, с которой производилась оплата, в течение 3 рабочих дней от даты
                        отмены заказа.
                    </p>
                    <p>Будем рады видеть Вас на наших других мероприятиях! {":)"}</p>
                    <EmailSignature />
                </Body>
            </Tailwind>
        </Html>
    )
}
