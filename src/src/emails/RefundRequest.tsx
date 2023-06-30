import * as React from "react"
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import { Body } from "@react-email/body"
import EmailSignature from "./EmailSignature"

export default function RefundRequest({ url, orderId }: { url: string; orderId: number }) {
    return (
        <Html>
            <Tailwind>
                <Body className="bg-white">
                    <p>
                        Запрос на возврат билетов. Номер заказа:{" "}
                        <b>
                            <a href={url}>{orderId}</a>
                        </b>
                    </p>
                    <EmailSignature />
                </Body>
            </Tailwind>
        </Html>
    )
}
