import * as React from 'react'
import { Html } from '@react-email/html'
import EmailSignature from './EmailSignature'

export default function Refund() {
    return (
        <Html>
            <p style={{ textAlign: "center" }}>Уважаемый зритель!</p>
            <p>Сожалеем, что досадные обстоятельства помешали Вашему посещению Нян-Феста 2023.</p>
            <p>
                Теперь хорошие новости: отмена Вашего заказа билетов успешно произведена.
                Стоимость билетов будет возвращена Вам на банковскую карту, с которой производилась оплата,
                в течение 3 рабочих дней от даты отмены заказа.
            </p>
            <p>Будем рады видеть Вас на наших других мероприятиях! {":)"}</p>
            <EmailSignature />
        </Html>
    )
}