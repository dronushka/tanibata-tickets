"use client"
import FullAreaMessage from "@/components/FullAreaMessage"
import { Box, Button, Group, List, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import Link from "next/link"

export default function ClientMain({ venues }: { venues: (Omit<Venue, "start"> & { start: string })[] }) {
    return <FullAreaMessage>
        {/* <Stack> */}
        {/* <Text fz="lg" fw="bold" mb="md" align="center">Дорогой зритель, система закрыта!</Text>
        <Text mb="md">Спасибо что воспользовались системой продажи билетов фестиваля Нян-фест 2023!</Text>
        <Text mb="md">Билеты на концерт (начало в 21:00) можно приобрести на входе в ОДНТ</Text>
        <Text mb="md">Подробности о фестивале в группе vk: <Link href="https://vk.com/tanibata">Танибата, Нян-фест и Алоха — фестивали в Ростове</Link></Text>
 */}
        <Text>Ты решил стать нашим гостем на Мультикультурном фестивале «Нян-фест» 2023?</Text>
        <Text>Тогда косплей-шоу, концерт, ярмарка, мастер-классы, фотозона и многое другое ждут тебя!</Text>
        <Text mb="md">На этой странице ты можешь выбрать место в зале, забронировать и купить билеты.</Text>

        <Text mb="md">Фестиваль пройдёт в субботу 25 марта в ОДНТ, пл. К. Маркса 5/1, г. Ростов-на-Дону.</Text>

        <Text mb="md">Подробности о фестивале в группе vk: <Link href="https://vk.com/tanibata">Танибата, Нян-фест и Алоха — фестивали в Ростове</Link></Text>

        <Text fw="bold" mb="md">Цена билетов</Text>
        <Text>— билет на косплей-шоу «Стандарт» — 900 рублей;</Text>
        <Text>— билет на косплей-шоу VIP (места в зале с лучшим обзором) — 1300 рублей;</Text>
        <Text>— билет на косплей-шоу и концерт «Добро» с пакетом сувениров от фестиваля, ранним входом в зал и экскурсией — 2500 рублей.</Text>
        <Text fw="lighter" mt="xs" mb="md">Ближе к мероприятию стоимость может увеличиться.</Text>
        <Text fw="bold" mb="md">Что происходит после окончания косплей-шоу?</Text>
        <Text mb="md">Откроем тайну — фестиваль на этом не заканчивается!</Text>
        <Text mb="md">Мы ждём тебя на концерте и обещаем много интересного от эстрадных звёзд «Танибаты», «Нян-феста» и, конечно же, «Алохи»!</Text>
        <Text mb="md">
            Основная часть вокальных и изрядная доля танцевальных выступлений, которые не поместились в программу косплей-шоу,
            порадуют тебя на концерте. Это около 30 песен и танцев в ламповой и уютной атмосфере, в мягких креслах,
            в которых так приятно расслабиться после целого дня активностей и драйва «Нян-феста».
        </Text>
        <Text mb="md">А если на месте не сидится, поддержать вокалистов можно на сцене — конечно, если они пригласят к себе зрителей.</Text>
        <Text mb="md">Можно подпевать! Можно танцевать!</Text>
        <Text mb="md">Приходите, будет весело!</Text>
        <Text fw="bold" mb="md">Билет на Концерт - 300 рублей</Text>

        <Group sx={{ justifyContent: "center" }} mb="sm">
            {venues.map(venue => <Stack key={venue.id} sx={{ minWidth: 200 }}>
                <Text fw="bold">{venue.name}</Text>
         
                <Link href={"/orders/make/" + venue.id} passHref legacyBehavior>
                    <Button component="a">Купить билеты</Button>
                </Link>
            </Stack>)}
        </Group>
        <Text>
            По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:
        </Text>
        <Text><Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link></Text>
        <Text><Link href="tel:79054536789">+7 (905) 4536789</Link></Text>
        <Text><Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link></Text>
        <Text><Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link></Text>
    </FullAreaMessage >
}