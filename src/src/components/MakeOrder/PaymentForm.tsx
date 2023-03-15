import { useState } from "react"
import { z } from "zod"
import { Avatar, Box, Button, Checkbox, FileButton, Flex, Group, Input, List, Paper, Popover, Stack, Text, Textarea, TextInput, Tooltip } from "@mantine/core"
import { IconInfoCircle, IconUpload } from "@tabler/icons-react"
import { ClientOrder } from "./useOrder"
import Link from "next/link"
import { PriceRange, Venue } from "@prisma/client"

export default function PaymentForm({ venue, order, onSubmit }:
    { venue: (Omit<Venue, "start"> & { start: string, priceRange: PriceRange[] }), order: ClientOrder, onSubmit: (order: ClientOrder) => void }) {

    const [goodness, setGoodness] = useState(order.isGoodness)
    const [comment, setComment] = useState(order.comment)
    const [cheque, setCheque] = useState<File | undefined>(order?.cheque)

    const [chequeError, setChequeError] = useState<string>("")

    const chequeValidator = z.custom<File>().superRefine((file, ctx) => {
        if (!(file instanceof File)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Приложите файл",
                fatal: true,
            })

            return z.NEVER
        }

        if (file.size > 2 * 1024 * 1024) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Размер файл не должен превышать 2МБ",
                fatal: true
            })

            return z.NEVER
        }

        if (!(["image/png", "image/jpeg", "application/pdf"].find(f => f === file.type))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Допустимые форматы файла: jpeg, png, pdf",
                fatal: true
            })

            return z.NEVER
        }

    })

    const changeCheque = (value: File) => {
        const res = chequeValidator.safeParse(value)

        if (res.success) {
            setChequeError("")
            setCheque(value)
        }
        else
            setChequeError(res.error.flatten().formErrors.join(', '))
    }

    const send = () => {
        const res = chequeValidator.safeParse(cheque)
        if (res.success)
            onSubmit({ ...order, isGoodness: goodness, comment, cheque })
        else
            setChequeError(res.error.flatten().formErrors.join(', '))
    }

    const sum = venue.noSeats
        ? order.ticketCount * venue.priceRange[0].price
        : [...order.tickets.values()].reduce((s, ticket) => (s += (ticket.priceRange?.price ?? 0)), 0)

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Text fz="xl">Билеты забронированы!</Text>
                <List type="ordered">
                    {[...order.tickets.values()].map(ticket => (
                        <List.Item key={ticket.id} >
                            <Group>
                                <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                <Text>{goodness ? Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0).toFixed(2) : ticket.priceRange?.price.toFixed(2)} р.</Text>
                            </Group>
                        </List.Item>
                    ))}
                </List>
                <Group>
                    <Checkbox
                        label="Активировать Добро!"
                        checked={goodness}
                        onChange={(event) => setGoodness(event.currentTarget.checked)}
                    />
                    <Text>Билеты &quot;Добро&quot; - это способ дополнительно поддержать фестиваль! </Text>
                    <Text>Стоимость такого билета составляет 2500 вне зависимости от места. </Text>
                    <Text>В дополнение к этому вы получаете уникальные сувениры от оргкома фестиваля!</Text>
                    {/* <Tooltip
                        label='Билеты "Добро" - это способ дополнительно поддержать фестиваль! 
                    Стоимость такого билета составляет 2500 вне зависимости от места. 
                    В дополнение к этому вы получаете уникальные сувениры от оргкома фестиваля!'
                        multiline
                        width={300}
                        events={{ hover: true, focus: true, touch: true }}
                    >
                        <IconInfoCircle />
                    </Tooltip> */}
                </Group>
                <Textarea
                    label="Вы можете оставить комментарий к заказу"
                    maxLength={1000}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />

                <Text>Для завершения, оплатите заказ на сумму {goodness ? (Number(process.env.NEXT_PUBLIC_GOODNESS_PRICE ?? 0) * order.ticketCount).toFixed(2) : sum.toFixed(2)} р. и приложите чек ниже.</Text>
                <Text>Реквизиты для перевода оплаты за билеты</Text>

                <Text weight={700}>1234 5678 9012 3456, Сбербанк.</Text>
                <Text>Перевод на имя: Дмитрий З..</Text>

                <Text>
                    В поле &quot;Назначение платежа&quot; при оплате указывать ничего не требуется,
                    данные о билете мы автоматически получаем из данной формы.
                </Text>
                <Text>
                    Оплатить заказ и загрузить чек в систему бронирования билетов необходимо в течение суток
                    с момента создания заказа, иначе заказ автоматически отменяется,
                    а выбранные вами места возвращаются в свободную продажу.
                </Text>
                <Text>
                    Данные платежа будут нами обработаны в течение трех дней с момента оплаты.
                    Статус обработки заказа можно увидеть в разделе <Link href="/orders">Мои заказы</Link> системы бронирования,
                    при возникновении вопросов по поводу покупки билетов можно связаться с билетером фестиваля
                    по адресу почты <Link href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</Link>,
                    по телефону <Link href="tel:79054536789">+7 (905) 4536789</Link>{" "}
                    или по адресу в <Link href="https://vk.com/cheshira_rnd">VK: Anna Kramarenko</Link>.
                </Text>
                {/* <Checkbox 
                    label="Активировать Добро!"
                    checked={checked} 
                    onChange={(event) => setChecked(event.currentTarget.checked)} 
                /> */}
                <Group>
                    <Box>
                        {cheque && <Text>{cheque.name}</Text>}
                        <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                        <Text color="gray" size="sm">Файл формате: jpeg, png, pdf</Text>
                    </Box>
                    <Box>
                        <FileButton
                            onChange={changeCheque}
                            accept="image/png,image/jpeg,application/pdf"
                        >
                            {(props) => (
                                <Button
                                    {...props}
                                    color={chequeError ? "red" : "primary"}
                                    variant="outline"
                                    leftIcon={<IconUpload />}
                                >
                                    Приложить чек
                                </Button>
                            )}
                        </FileButton>
                        <Input.Error>{chequeError}</Input.Error>
                    </Box>
                </Group>
                <Flex >
                    <Button onClick={send}>Отправить</Button>
                </Flex>
            </Stack>
        </Paper>
    )
}