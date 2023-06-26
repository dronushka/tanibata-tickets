"use client"

import { List, Text } from "@mantine/core"
import Link from "next/link"
import FullAreaMessage from "../../components/FullAreaMessage"

export default function Help() {
    return (
        <FullAreaMessage>
            <Text fz="lg" mb="md">
                Дорогой зритель «Танибаты»!
            </Text>
            <Text>Реквизиты для перевода оплаты за билеты:</Text>
            <Text weight={700}>4274 3200 4304 7698, Сбербанк.</Text>
            <Text mb="md">Перевод на имя: Анастасия Викторовна В.</Text>

            <Text>
                По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:
            </Text>
            <Text>
                <Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link>
            </Text>
            <Text>
                <Link href="tel:79054536789">+7 (905) 4536789</Link>
            </Text>
            <Text>
                <Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link>
            </Text>
            <Text>
                <Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link>
            </Text>

            <Text fw="bold" mt="md" mb="md">
                Возврат билета
            </Text>
            <List mb="md">
                <List.Item>
                    Если билет электронный — необходимо связаться по указанным выше контактам, написав номер заказа и номер карты
                    для возврата. Возврат средств осуществляется на ту же банковскую карту, с которой производился платеж за
                    билеты, электронный билет при этом станет недействительным.
                </List.Item>
                <List.Item>
                    Если билет бумажный, его можно вернуть в пункте продажи билетов или в день фестиваля в здании ОДНТ.
                </List.Item>
            </List>
            <Text mb="md">
                Возврат билетов прекращается за один час до начала фестиваля. Вернуть билет на 1-ый день фестиваля во 2-ой
                невозможно.
            </Text>
            <Text mb="md">
                Просим обратить внимание, что в день фестиваля билетёр может реже проверять сообщения и почту, поэтому рекомендуем
                звонить.
            </Text>

            <Text fw="bold" mt="md" mb="md">
                Билеты «Добро»
            </Text>
            <Text>Билеты «Добро» — это способ дополнительно поддержать фестиваль, получив за это дополнительные бонусы!</Text>
            <Text>Об этом читай на главной странице системы онлайн-покупки, там же указана их стоимость.</Text>
        </FullAreaMessage>
    )
}
