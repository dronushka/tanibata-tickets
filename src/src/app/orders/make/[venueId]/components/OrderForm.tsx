"use client"

import { Button, Checkbox, Flex, Group, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import MaskInput from "@/components/MaskInput"
import { signOut } from "next-auth/react"
import { ClientOrder, PaymentData, paymentDataSchema } from "../hooks/useOrder"
// import { getPaymentData } from "@/lib/api-calls"
import FullAreaMessage from "@/components/FullAreaMessage"
import Link from "next/link"

type PaymentFormErrors = {
    name?: string[],
    phone?: string[],
    email?: string[]
    age?: string[],
    nickname?: string[],
    social?: string[],
    network?: string
} | null

export default function OrderForm({ data, onSubmit }: { data: PaymentData, onSubmit: (order: (prev: ClientOrder) => ClientOrder) => void }) {
    const [paymentData, setPaymentData] = useState<PaymentData>(data)

    const [agreedToRules, setAgreedToRules] = useState(false)

    useEffect(() => {
        setPaymentData(data)
    }, [data])

    const [paymentFormErrors, setPaymentFormErrors] = useState<PaymentFormErrors>(null)

    const setField = (field: keyof PaymentData, value: string | File | null) => {
        setPaymentData((prev: PaymentData) => ({ ...prev, [field]: value }))
        setPaymentFormErrors(prev => {
            if (prev)
                delete prev[field]
            return prev
        })
    }

    const sendPaymentOrder = () => {
        const validated = paymentDataSchema.safeParse(paymentData)

        if (validated.success === false) {
            console.log(paymentData)

            setPaymentFormErrors(validated.error.flatten().fieldErrors)
            return
        }
        onSubmit(order => ({ ...order, paymentData: validated.data }))
    }

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Paper shadow="sm" radius="md" p="md">
                <Stack>
                    <TextInput
                        // disabled={loading}
                        label="ФИО"
                        name="fullname"
                        withAsterisk
                        maxLength={191}
                        value={paymentData.name}
                        onChange={e => setField("name", e.target.value)}
                        error={paymentFormErrors?.name?.join(', ')}
                    />
                    <MaskInput
                        // disabled={loading}
                        label="Телефон"
                        name="phone"
                        withAsterisk
                        mask="+7 (000) 000-00-00"
                        maxLength={19}
                        value={paymentData.phone}
                        onChange={value => setField("phone", value)}
                        error={paymentFormErrors?.phone?.join(', ')}
                    />
                    <TextInput
                        // disabled={loading}
                        label="Возраст"
                        name="age"
                        withAsterisk
                        maxLength={2}
                        value={paymentData.age}
                        onChange={e => setField("age", e.target.value.replace(/\D/, ''))}
                        error={paymentFormErrors?.age?.join(', ')}
                    />
                    <TextInput
                        // disabled={loading}
                        label="Никнейм"
                        name="nickname"
                        maxLength={191}
                        value={paymentData.nickname}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, nickname: e.target.value }))}
                    />
                    <TextInput
                        // disabled={loading}
                        label="Адрес страницы VK (если есть, для оперативной связи)"
                        name="social"
                        maxLength={191}
                        value={paymentData.social}
                        onChange={(e) => setField("social", e.target.value)}
                        error={paymentFormErrors?.social?.join(', ')}
                    />
                    <Checkbox
                        label={<Text sx={{ maxWidth: 310 }}>
                            Я согласен с <Link href="/rules" target="_blank">Правилами посещения фестиваля</Link>
                            {" и "}<Link href="/privacy" target="_blank">Политикой конфиденциальности и обработки персональных данных</Link>
                        </Text>}
                        checked={agreedToRules}
                        onChange={() => setAgreedToRules(prev => !prev)}
                    />
                    <Flex justify="flex-end">
                        <Group>
                            <Button
                                // disabled={loading}
                                leftIcon={<IconArrowLeft />}
                                variant="default"
                                onClick={() => signOut()}
                            >
                                Войти с другим e-mail
                            </Button>
                            <Button
                                disabled={!agreedToRules}
                                onClick={sendPaymentOrder}
                            >
                                Далее
                            </Button>
                        </Group>
                    </Flex>
                </Stack>
            </Paper>
        </Flex>
    )
}