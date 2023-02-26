"use client"

import { Box, Button, FileButton, Flex, Group, Input, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconArrowLeft, IconUpload } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import MaskInput from "../mask-input"
import { PaymentData, paymentDataSchema } from "@/types/types"
import { initialOrder, useOrder } from "./use-order"
import { User } from "@prisma/client"

type PaymentFormErrors = {
    name?: string[],
    phone?: string[],
    email?: string[]
    age?: string[],
    nickname?: string[],
    social?: string[],
    cheque?: string[]
} | null

export default function PaymentForm() {
    const { order, nextStage, prevStage } = useOrder()

    const [paymentData, setPaymentData] = useState<PaymentData>(initialOrder.paymentData)

    useEffect(() => {
        if (order)
            setPaymentData(order.paymentData)
    }, [order])

    const [paymentFormErrors, setPaymentFormErrors] = useState<PaymentFormErrors>(null)
    
    const setField = (field: keyof PaymentData, value: string | File | null) => {
        setPaymentData(prev => ({ ...prev, [field]: value }))
        setPaymentFormErrors(prev => {
            if (prev)
                delete prev[field]
            return prev
        })
    }

    const sendPaymentOrder = () => {
        const validated = paymentDataSchema.safeParse(paymentData)
        console.log(validated)

        if (validated.success === false) {
            setPaymentFormErrors(validated.error.flatten().fieldErrors)
            return
        }

        if (order) 
            nextStage({...order, paymentData: validated.data})
    }

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Button 
                    leftIcon={<IconArrowLeft />} 
                    variant="subtle"
                    onClick={prevStage}
                >
                        Вернуться к выбору билетов
                </Button>
                <Box>
                    <Text>
                        Вы открыли форму для покупки билетов на «Алоха! Косплей-фест», который пройдёт 3 сентября 2022 года на Стерео пляже
                    </Text>
                    <Text>
                        Пожалуйста, заполните все данные ниже, оплатите необходимое количество билетов по указанным реквизитам и обязательно приложите квитанцию или чек о переводе к заявке. После обработки заявки и проверки платежа (в течении 3 дней) Вам придёт подтверждение от билетера «Алоха! Косплей-феста» о том, что билеты закреплены за Вами.
                    </Text>
                    <Text>
                        Контактные данные и реальные фамилия, имя и отчество необходимы для формирования списков, по которым при входе на мероприятие Вам будут выданы билеты, а также для связи по вопросам купленных билетов.
                    </Text>
                </Box>
                <TextInput
                    label="ФИО"
                    withAsterisk
                    value={paymentData?.name}
                    onChange={e => setField("name", e.target.value)}
                    error={paymentFormErrors?.name?.join(', ')}
                />
                <MaskInput
                    label="Телефон"
                    withAsterisk
                    mask="+7 (999) 999-99-99"
                    value={paymentData.phone}
                    onChange={value => setField("phone", value)}
                    error={paymentFormErrors?.phone?.join(', ')}
                />
                <TextInput
                    label="E-mail"
                    withAsterisk
                    value={paymentData.email}
                    onChange={e => setField("email", e.target.value)}
                    error={paymentFormErrors?.email?.join(', ')}
                />
                <TextInput
                    label="Возраст"
                    withAsterisk
                    value={paymentData.age}
                    onChange={e => setField("age", e.target.value.replace(/\D/, ''))}
                    error={paymentFormErrors?.age?.join(', ')}
                />
                <TextInput
                    label="Никнейм"
                    value={paymentData.nickname}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, nickname: e.target.value }))}
                />
                <TextInput
                    label="Адрес страницы VK (если есть, для оперативной связи)"
                    value={paymentData.social}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, social: e.target.value }))}
                />
                <Box>
                    <Text>Реквизиты для перевода оплаты за билеты</Text>

                    <Text>1234 5678 9012 3456, Сбербанк.</Text>
                    <Text>Перевод на имя: Дмитрий З..</Text>

                    <Text>В поле назначение платежа (сообщение) указывать ничего не требуется, данные о билете мы берём из данной формы.</Text>
                </Box>
                <Group>
                    <Box sx={{ flexGrow: 1 }}>
                        <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                        <Text color="gray" size="sm">Файл формате: jpeg, png, pd</Text>
                    </Box>
                    <Box>
                        {paymentData.cheque && <Text>{paymentData.cheque.name}</Text>}
                        <FileButton
                            onChange={value => setField("cheque", value)}
                            accept="image/png,image/jpeg"
                        >
                            {(props) => (
                                <Button
                                    {...props}
                                    color={paymentFormErrors?.cheque?.length ? "red" : "primary"}
                                    variant="outline"
                                    leftIcon={<IconUpload />}
                                >
                                    Прикрепить чек
                                </Button>
                            )}
                        </FileButton>
                        <Input.Error>{paymentFormErrors?.cheque?.join(', ')}</Input.Error>
                    </Box>
                </Group>
                <Flex justify="flex-end">
                    <Button onClick={sendPaymentOrder}>Отправить</Button>
                </Flex>
            </Stack>
        </Paper>
    )
}