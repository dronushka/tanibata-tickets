import * as React from 'react'
import { Html } from '@react-email/html'
import EmailSignature from './EmailSignature'

export default function Tickets() {
    return (
        <Html>
            <p style={{ textAlign: "center" }}>Спасибо за покупку!</p>
            <p style={{ textAlign: "center" }}><b>Ваш билет прикреплён к данному письму!</b></p>
            <p><b>Как пройти на фестиваль?</b></p>
            <ul>
                <li>Место проведения: ОДНТ, пл. Карла Маркса, 5/1, 25 марта 2023 г.</li>
                <li>Вход для зрителей будет открыт с 9:30 25 марта 2023 г.</li>
                <li>10:00 мастер-классы и лекции</li>
                <li>13:00 начало косплей-шоу</li>
                <li>Информация о фестивале: <a href="https://vk.com/tanibata" target="_blank" rel="noreferrer">Танибата, Нян-фест и Алоха — фестивали в Ростове</a></li>
            </ul>
            <p>
                Необходимо предъявить QR-код из этого электронного билета при входе на территорию проведения Нян-феста 2023.
                На руку всем гостям будут надеты браслеты, соответствующие типу приобретенных ими билетов.
                Браслет будет Вашим пропуском на фестиваль в течение всего дня.
            </p>
            <p>
                Также Вы получите сувенирный бумажный билет на Косплей-шоу с указанием ряда и номера места в зале.
                Если Вы оплатили в одной заявке несколько билетов, то получить все билеты и браслеты можно по одному QR-коду.
            </p>
            <p>
                Если вы захотите остаться после программы косплей-шоу Нян-феста 2023 на Концерт, билеты
                на него можно будет приобрести в ОДНТ до начала концерта в 21:00.
            </p>
            <p>
                <b>
                    В связи с требованиями противотерристической безопасности мы настоятельно рекомендуем брать
                    с собой оригинал удостоверения личности!
                </b>
            </p>
            <EmailSignature />
        </Html>
    )
}