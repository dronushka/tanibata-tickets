"use client"
import FullAreaMessage from "@/components/FullAreaMessage"
import { Box, Button, Grid, Group, List, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import Link from "next/link"

export default function ClientMain({ venues }: { venues: (Omit<Venue, "start"> & { start: string })[] }) {
    return (
        <FullAreaMessage>
            <Text fz="lg" fw="bold" mb="md" align="center">Система продажи билетов  фестиваля Танибата 2023 закрыта!</Text>
            <Text mb="md">Спасибо всем, кто купил билеты.</Text>
            <Text mb="md">Приобрести оставшиеся билеты, если они будут в наличии, можно будет 14.07 с 13:00 на генеральной репетиции фестиваля или в дни фестиваля (15-16 июля)!</Text>
            <Text mb="md">
                Информация об остатках билетов будет размещена здесь: 
                <Link href="https://t.me/+GVvy27KBMlBjOTdi">
                    https://t.me/+GVvy27KBMlBjOTdi
                </Link>
            </Text>
            {/* <Text mb="md">
                Ты решил стать нашим гостем на Южно-Российском Мультикультурном фестивале {"«"}Танибата{"»"} 2023?
            </Text>
            <Text mb="md">
                Тогда двухдневное косплей-шоу, концерт, ярмарка, мастер-классы, фотозона, танибатаходики и многое другое ждут
                тебя!
            </Text>
            <Text mb="md">
                На этой странице ты можешь выбрать место в зале (только на косплей-шоу, в остальных частях программы фестиваля
                рассадка свободная), забронировать и купить билеты.
            </Text>
            <Text mb="md">
                Фестиваль пройдёт в субботу и воскресенье 15-16 июЛя в ОДНТ, пл. К. Маркса, 5/1, г. Ростов-на-Дону.
            </Text>
            <Text mb="md">
                Подробности о фестивале в группе vk:{" "}
                <Link href="https://vk.com/tanibata" target="_blank">
                    Танибата, Нян-фест и Алоха — фестивали в Ростове
                </Link>
                .
            </Text>
            <Text my="md">
                <strong>Цена билетов:</strong>
            </Text>
            <Text mb="md">
                — билет на любой день косплей-шоу {"«"}Стандарт{"»"} — 1000 рублей (2000 руб. на оба дня);
            </Text>
            <Text mb="md">
                — билет на любой день косплей-шоу VIP (места в зале с лучшим обзором) — 1500 рублей (3000 руб. на оба дня);
            </Text>
            <Text mb="md">
                — билет Добро на 1-ый день Танибаты (косплей-шоу, концерт) с пакетом №1 сувениров от фестиваля, ранним входом в
                зал и экскурсией — 2800 рублей;
            </Text>
            <Text mb="md">
                — билет Добро на 2-ой день Танибаты (косплей-шоу) с пакетом №2 сувениров от фестиваля и ранним входом в зал — 2200
                рублей;
            </Text>
            <Text mb="md">
                <strong>
                    ! Любой билет на косплей-шоу автоматически предоставляет доступ на ярмарку и прочие фестивальные события на
                    территории ОДНТ до самого окончания косплей-шоу.
                </strong>
            </Text>
            <Text mb="md">— билет на Концерт (вечер 1-го дня, с доступом к ярмарке за час до начала концерта) — 350 рублей;</Text>
            <Text mb="md">
                — билет на танибатаходик (2-часовое плаванье по Дону с тематической музыкой и в исключительно фестивальной
                компании, сюда входит транспорт на набережную) — 1200 рублей;
            </Text>
            <Text mb="md">
                — билет Добро на танибатаходик с пакетом №3 сувениров от фестиваля и {'"'}автограф-сессией{'"'} организаторов -
                2000 рублей.
            </Text>
            <Text mb="md">— билет Добро без посещения фестиваля с отправкой сувениров - 2000 рублей.</Text>
            <Text mb="md">
                Вы можете помочь Танибате, даже не имея возможности посетить фестиваль. За доброту и участие вы будете
                вознаграждены набором эксклюзивных сувениров. Если вы из другого города, посылку мы отправим по почте на адрес,
                указанный в комметарии при оформлении билета. Если местный - можем договориться о более простом способе доставки вашего
                памятного бонуса. Все дополнительные средства от билетов Добро пойдут на поддержку и развитие фестиваля.
            </Text>
            <Text mb="md">
                По мере продаж стоимость билетов может увеличиться, количество билетов на косплей-шоу, концерт и теплоходы
                ограничено.
            </Text>
            <Text my="md">
                <strong>Немного о программе</strong>
            </Text>
            <Text mb="md">
                Центральное событие фестиваля - двухдневное косплей-шоу в Большом зале, его начало - в 13:00. Программа на оба дня
                разная, и в ней - сценические постановки (полноформатные и миниатюры), танцевальные выступления, немного вокала,
                дефиле (Люкс в 1-ый день, Классик во 2-ой день), а также видеоконкурс, розыгрыш для зрителей и тематическое
                ведение…
            </Text>
            <Text mb="md">
                Параллельно с шоу на фестивале с 10:00 проходят ярмарка и самые разнообразные активности: игры, мастер-классы,
                конкурсы арта, фотокосплея и многое другое. Доступ ко всему этому — по билетам на косплей-шоу.
            </Text>
            <Text my="md">
                <strong>Что же происходит после его завершения?</strong>
            </Text>
            <Text mb="md">Откроем тайну — фестиваль на этом не заканчивается!</Text>
            <Text mb="md">
                В 1-ый день мы ждём тебя на Концерте (начало в 21:00) и обещаем много интересного от эстрадных звёзд {"«"}Танибаты
                {"»"},&nbsp;
                {"«"}Нян-феста{"»"} и {"«"}Алохи{"»"}!
            </Text>
            <Text mb="md">
                Основная часть вокальных и изрядная доля танцевальных выступлений, которые не поместились в программу косплей-шоу,
                порадуют тебя именно там. Это около 2,5 часов в ламповой и уютной атмосфере, в мягких креслах, в которых так
                приятно расслабиться после целого дня фестивальных активностей и драйва.
            </Text>
            <Text mb="md">
                А если на месте не сидится, поддержать вокалистов можно на сцене — конечно, если они пригласят к себе зрителей.
            </Text>
            <Text mb="md">Можно подпевать! Можно танцевать! А можно дошивать косплей на завтра при свете фонарика. {":)))"}</Text>
            <Text mb="md">
                После окончания 2 дня косплей-шоу те, кто приобрели билеты на <strong>теплоход</strong>, быстро собираются, в
                18:40 грузятся по нашим автобусам и едут на набережную, куда будут поданы два танибатаходика. Такое яркое и
                необычное завершение фестиваля существует только на Танибате! Два часа отрыва в компании без посторонних, под
                фандомную музыку, с символическим бросанием в воду Дерева Желаний - впечатление на год вперёд!
            </Text>
            <Text mb="md">
                Подчеркнём, что количество билетов на косплей-шоу, концерт и особенно танибатаходики ограничено вместимостью зала
                (около 700 мест) и теплоходов (всего по 190 мест на каждом), это требования безопасности и связанного с ней
                законодательства. Мы не сможем продать билетов больше, чем существует мест, как бы нас ни уговаривали, кем бы ты
                ни был. Заранее просим это учитывать!
            </Text>
            <Text mb="md">
                Если твои обстоятельства изменились, ты можешь вернуть билет; крайне желательно сделать это не позднее 3 дней до
                начала фестиваля. Скорость возврата денежных средств зависит от банков и платежных систем, а также загруженности
                билетёра накануне фестиваля. Просим отнестись с пониманием!
            </Text>

            <Grid>
                {venues.map((venue) => (
                    <Grid.Col key={venue.id} xs={12} sm={6} lg={4}>
                        <Text fw="bold" sx={{ textWrap: "nowrap" }}>
                            {venue.name}
                        </Text>

                        <Link href={"/orders/make/" + venue.id} passHref legacyBehavior>
                            <Button component="a" fullWidth>
                                Купить билеты
                            </Button>
                        </Link>
                    </Grid.Col>
                ))}
                </Grid>*/}
            <Text mt="md">
                По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:
            </Text>
            <Text>
                <Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link>
            </Text>
            {/*<Text>
                <Link href="tel:79054536789">+7 (905) 4536789</Link>
            </Text>
            <Text>
                <Link href="https://t.me/anna_cheshira">t.me/anna_cheshira</Link>
            </Text>
            <Text>
                <Link href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</Link>
            </Text> */}
        </FullAreaMessage>
    )
}
