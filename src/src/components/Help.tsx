"use client"

import { Text } from "@mantine/core"
import Link from "next/link"
import FullAreaMessage from "./FullAreaMessage"

export default function Help() {
    return <FullAreaMessage>
        <Text fz="lg" mb="md">Дорогой зритель Нян-феста!</Text>
        <Text>
            По любым вопросам, связанным с покупкой или возвратом билета вы можете связаться с билетёром фестиваля Чеширой:
        </Text>
        <Text><Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link></Text>
        <Text><Link href="tel:79054536789">+7 (905) 4536789</Link></Text>
        <Text><Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link></Text>
        <Text><Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link></Text>

        <Text fw="bold" mt="md" mb="md">Возврат билета</Text>
        <Text>Для возврата билета необходимо:</Text>
        <Text mb="md">
            Если билет электронный, связаться по указанным выше контактам, указав номер заказа и номер карты для возврата. Возврат средств осуществляется на ту же банковскую карту, с которой производился платеж за билеты, электронный билет при этом станет недействительным.
        </Text>
        <Text mb="md">
            Если билет бумажный, его можно вернуть в пункте продажи билетов или в день фестиваля 25 марта 2023 года в здании ОДНТ.
        </Text>
        <Text mb="md">Возврат билетов прекращается за один час до начала фестиваля.</Text>

        <Text mb="md">
            В случае, если нужно что-то уточнить или есть беспокойство по поводу возврата 
            - нам можно позвонить по номеру <Link href="tel:79054536789">+7 (905) 4536789</Link>, 
            написать в <Link href="https://vk.com/cheshira_rnd">VK: Anna Kramarenko</Link>, 
            в телеграмм <Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link>{" "}
            или на электронную почту <Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link>.
        </Text>
        <Text mb="md">
            Просим обратить внимание, что в день фестиваля ответ на письма или сообщения может быть затруднен, рекомендуем в этом случае звонить.
        </Text>
        <Text fw="bold" mt="md" mb="md">Билеты &quot;Добро&quot;</Text>
        <Text>
            Билеты &quot;Добро&quot; - это способ дополнительно поддержать фестиваль! 
        </Text>
        <Text>Стоимость такого билета составляет 2500 вне зависимости от места.</Text>
        <Text>В дополнение к этому вы получаете уникальные сувениры от оргкома фестиваля!</Text>

    </FullAreaMessage>

}