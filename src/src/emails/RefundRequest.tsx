import * as React from 'react'
import { Html } from '@react-email/html'
import EmailSignature from './EmailSignature'

export default function RefundRequest({ url, orderId }: { url: string, orderId: number }) {
    return (
        <Html>
            <p>Зарос на возврат билетов. Номер заказа: <b><a href={url}>{orderId}</a></b></p>
            <EmailSignature />
        </Html>
    )
}