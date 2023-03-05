"use client"

import { Button, Flex, Group, Paper, Stack, TextInput } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import MaskInput from "../mask-input"
import { initialOrder, PaymentData, paymentDataSchema, useOrder } from "./use-order"
import { signOut } from "next-auth/react"

type PaymentFormErrors = {
    name?: string[],
    phone?: string[],
    email?: string[]
    age?: string[],
    nickname?: string[],
    social?: string[]
} | null

export default function OrderForm() {
    const { order, nextStage } = useOrder()

    const [paymentData, setPaymentData] = useState<PaymentData>(initialOrder.paymentData)

    useEffect(() => {
        if (order)
            setPaymentData(order.paymentData)
    }, [order])

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
            setPaymentFormErrors(validated.error.flatten().fieldErrors)
            return
        }

        if (order)
            nextStage({ ...order, paymentData: validated.data })
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
                    <Flex justify="flex-end">
                        <Group>
                            <Button
                                leftIcon={<IconArrowLeft />}
                                variant="default"
                                onClick={() => signOut()}
                            >
                                Войти с другим e-mail
                            </Button>
                            <Button onClick={sendPaymentOrder}>Далее</Button>
                        </Group>
                    </Flex>
                </Stack>
            </Paper>
        </Flex>
    )
}