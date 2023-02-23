"use client"

import { z } from "zod"
import { Box, Button, FileButton, Group, Input, Paper, Text, TextInput } from "@mantine/core"
import { IconArrowLeft, IconUpload } from "@tabler/icons-react"
import PhoneInput from "./phone-input"
import { useState } from "react"

// type PaymentFormData = {
//     name: string,
//     phone: string
// }
const formValidator = z.object({
    name: z.string().min(1, "Введите имя"),
    phone: z.string().min(10, "Введите телефон").max(10)
})

type PaymentFormData = z.infer<typeof formValidator>

type PaymentFormErrors = {
    name?: string[],
    phone?: string[]
} | null

export default function PaymentForm() {


    const [ paymentFormData, setPaymentFormData ] = useState<PaymentFormData>({
        name: "",
        phone: ""
    })

    const [ paymentFormErrors, setPaymentFormErrors ] = useState<PaymentFormErrors>(null)

    const setFile = () => {

    }

    const sendPaymentOrder = () => {
        const validated = formValidator.safeParse(paymentFormData)

        // console.log(validated)

        if (!validated.success) {
            setPaymentFormErrors(validated.error.flatten().fieldErrors)
            
        } else {

        }

    }
    console.log(paymentFormErrors)
    return (
        <Paper shadow="sm" radius="md" p="md">
            <Button leftIcon={<IconArrowLeft />} variant="subtle">Вернуться к выбору билетов</Button>
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
                value={paymentFormData.name}
                onChange={e => {
                    setPaymentFormData(prev => ({ ...prev, name: e.target.value}))
                    setPaymentFormErrors(prev => {
                        if (prev?.name) {
                            const { name, ...rest } = prev
                            return rest
                        }
                        return prev
                    })
                }}
                error={paymentFormErrors?.name?.join(', ')}
            />
            <PhoneInput 
                label="Телефон"
                withAsterisk
                value={paymentFormData.phone}
                setValue={value => {
                    setPaymentFormData(prev => ({ ...prev, phone: value}))
                    setPaymentFormErrors(prev => {
                        if (prev?.phone) {
                            const { phone, ...rest } = prev
                            return rest
                        }
                        return prev
                    })
                }}
                error={paymentFormErrors?.phone?.join(', ')}
            />

            <TextInput
                label="E-mail"
                withAsterisk
            />
            <TextInput
                label="Возраст"
                withAsterisk
            />
            <TextInput
                label="Никнейм"
            />
            <TextInput
                label="Адрес страницы VK (если есть, для оперативной связи)"
            />
            <Button onClick={sendPaymentOrder}>Отправить</Button>
            <Box>
                <Text>Реквизиты для перевода оплаты за билеты</Text>

                <Text>1234 5678 9012 3456, Сбербанк.</Text>
                <Text>Перевод на имя: Дмитрий З..</Text>

                <Text>В поле назначение платежа (сообщение) указывать ничего не требуется, данные о билете мы берём из данной формы.</Text>
            </Box>
            <Group>
                <Text color="gray" size="sm">Файлы размером не более 25 Мб, в формате: jpeg, png, pd</Text>
                <FileButton onChange={setFile} accept="image/png,image/jpeg">
                    {(props) => (
                        <Button
                            {...props}
                            leftIcon={<IconUpload />}
                            variant="outline"
                        >
                            Прикрепить чек
                        </Button>
                    )}
                </FileButton>
            </Group>
        </Paper>
    )
}