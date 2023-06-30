import * as React from "react"
import { Html } from "@react-email/html"
import EmailSignature from "./EmailSignature"
import { Tailwind } from "@react-email/tailwind"
import { Body } from "@react-email/body"

export default function Authorize({ url }: { url: string }) {
    return (
        <Html>
            <Tailwind>
                <Body className="bg-white">
                    <p style={{ textAlign: "center" }}>
                        <b>
                            {">>"}{" "}
                            <a href={url} target="_blank" rel="noreferrer">
                                Вход в систему покупки билетов
                            </a>{" "}
                            {"<<"}
                        </b>
                    </p>
                    <EmailSignature />
                </Body>
            </Tailwind>
        </Html>
    )
}
