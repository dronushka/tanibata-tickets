import * as React from "react"
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import { Body } from "@react-email/body"
import EmailSignature from "./EmailSignature"

export default function Tickets({ description }: { description: string}) {
    return (
        <Html>
            <Tailwind>
                <Body className="bg-white">
                    <p className="text-center">Спасибо за покупку!</p>
                    <p className="text-center"><b>Ваш билет прикреплён к данному письму!</b></p>

                    <div dangerouslySetInnerHTML={{__html: description}} />
                    {/* TODO use markup or smth. Storing raw html is awkward */}
                    
                    <EmailSignature />
                </Body>
            </Tailwind>
        </Html>
    )
}
