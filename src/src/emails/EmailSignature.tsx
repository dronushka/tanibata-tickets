import * as React from 'react'
import { Hr } from '@react-email/hr'

export default function EmailSignature() {
    return <>
        <Hr />
        <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
        <p style={{ margin: "2px 0 2px 0" }}><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
        <p style={{ margin: "2px 0 2px 0" }}><a href="tel:79054536789">+7 (905) 4536789</a></p>
        <p style={{ margin: "2px 0 2px 0" }}><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
        <p style={{ margin: "2px 0 2px 0" }}><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a></p>
    </>
}