import * as React from 'react'
import { Html } from '@react-email/html'
import EmailSignature from './EmailSignature'

export default function Authorize({ url }: { url: string }) {
    return (
        <Html>
            <p style={{ textAlign: "center" }}>
                <b>{">>"} <a href={url} target="_blank" rel="noreferrer">Вход в систему покупки билетов</a> {"<<"}</b>
            </p>
            <EmailSignature />
        </Html>
    )
}