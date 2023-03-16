"use client"

import { List, Text } from "@mantine/core"
import Link from "next/link"
import FullAreaMessage from "../../components/FullAreaMessage"

export default function Help() {
    return <FullAreaMessage>
        <Text fz="lg" mb="md">Дорогой зритель «Нян-феста»!</Text>
        <Text>
            По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:
        </Text>
        <Text><Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link></Text>
        <Text><Link href="tel:79054536789">+7 (905) 4536789</Link></Text>
        <Text><Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link></Text>
        <Text><Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link></Text>

        <Text fw="bold" mt="md" mb="md">Возврат билета</Text>
        <Text mb="md">Для возврата билета необходимо:</Text>
        <List mb="md">
            <List.Item>
                Если билет электронный, связаться по указанным выше контактам, написав номер заказа и номер карты для возврата.
                Возврат средств осуществляется на ту же банковскую карту, с которой производился платеж за билеты,
                электронный билет при этом станет недействительным.
            </List.Item>
            <List.Item>
                Если билет бумажный, его можно вернуть в пункте продажи билетов или в день фестиваля 25 марта 2023 года в здании ОДНТ.
            </List.Item>
        </List>
        <Text mb="md">Возврат билетов прекращается за один час до начала фестиваля.</Text>

        <Text mb="md">
            В случае, если нужно что-то уточнить по поводу возврата, можно позвонить по
            номеру <Link href="tel:79054536789">+7 (905) 4536789</Link>,
            написать в VK: <Link href="https://vk.com/cheshira_rnd">Anna Kramarenko</Link>,
            в телеграмм <Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link>{" "}
            или на электронную почту <Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link>.
        </Text>
        <Text mb="md">
            Просим обратить внимание, что в день фестиваля билетёр может реже проверять сообщения и почту,
            поэтому рекомендуем звонить.
        </Text>
        <Text fw="bold" mt="md" mb="md">Билеты «Добро»</Text>
        <Text>Билеты «Добро» — это способ дополнительно поддержать фестиваль!</Text>
        <Text>Стоимость билета составляет 2500 рублей вне зависимости от места.</Text>
        <Text>Ты получишь билеты сразу и на косплей-шоу, и на концерт, а ещё уникальные сувениры от оргкома фестиваля!</Text>

    </FullAreaMessage>

}