"use client"
import FullAreaMessage from "@/components/FullAreaMessage"
import { Box, Button, Group, List, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import Link from "next/link"

export default function ClientMain({ venues }: { venues: (Omit<Venue, "start"> & { start: string })[] }) {
    return <FullAreaMessage>
        {/* <Stack> */}
        <Text fz="lg" mb="md">Дорогой зритель!</Text>

        <Text>Ты решил стать нашим гостем на Мультикультурном фестивале Нян-фест 2023?</Text>
        <Text>Тогда косплей-шоу, концерт, ярмарка, мастер-классы, фотозона и многое другое ждут тебя!</Text>
        <Text mb="md">На этой странице ты можешь выбрать место в зале, забронировать и купить билеты.</Text>

        <Text mb="md">Подробности о фестивале: Танибата, Нян-фест и Алоха — фестивали в Ростове</Text>

        <Text fz="lg">Цена билетов</Text>
        <Text>- Билет на косплей-шоу «Стандарт» - 900 рублей</Text>
        <Text>- Билет на косплей-шоу VIP (места в зале с лучшим обзором) - 1300 рублей</Text>
        <Text>- Билет на косплей-шоу и концерт «Добро» с пакетом сувениров от фестиваля - 2500 рублей</Text>

        <Text fw="lighter" mt="xs" mb="xs">
            Любой билет может стать &quot;Добром&quot;,
            для этого просто отметь соответствующую опцию при выборе мест.
            Это вариант для тех, кто хочет стать Другом фестиваля и помочь развитию наших дальнейших проектов!
        </Text>
        <Text mb="md">- Билет на концерт приобретается отдельно, его цена - 300 рублей</Text>
        <Group sx={{ justifyContent: "center" }} mb="sm">
            {venues.map(venue => <Stack key={venue.id} sx={{ minWidth: 200 }}>
                <Text fw="bold">{venue.name}</Text>
                {/* <Text>{venue.description}</Text> */}
                <Link href={"/orders/make?venue=" + venue.id} passHref legacyBehavior>
                    <Button component="a">Купить билеты</Button>
                </Link>
            </Stack>)}
        </Group>
        <Text>
            По любым вопросам, связанным с покупкой или возвратом билета вы можете связаться с билетёром фестиваля Чеширой:
        </Text>
        <Text><Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link></Text>
        <Text><Link href="tel:79054536789">+7 (905) 4536789</Link></Text>
        <Text><Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link></Text>
        <Text><Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link></Text>
    </FullAreaMessage >
}