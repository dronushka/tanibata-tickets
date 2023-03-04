"use client"

import { Row, User, Venue } from "@prisma/client"
import { Button, Container, Loader, Stack, Stepper, Text, ThemeIcon } from "@mantine/core"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import { useSession } from "next-auth/react"
import { ClientTicket, OrderProvider, OrderStage, TicketRow, useOrder } from "./use-order"
import Link from "next/link"
import FullPageMessage from "../full-page-message"
import LoginForm from "../login-form"
import OrderError from "./order-error"
import OrderForm from "./order-form"
import PaymentForm from "./payment-form"
import TicketsPicker from "./tickets-picker/tickets-picker"

function Scaffolding({ venue }: { venue: (Venue & { rows: TicketRow[] }) | null }) {
    const { status } = useSession()

    const { order, nextStage, prevStage, setOrder } = useOrder()

    const getStepNumber = (step?: OrderStage) => {
        const stages = ["authenticate", "form", "tickets", "payment", "complete"]
        return stages.findIndex(s => s === step)
    }

    // console.log({ user })
    // console.log({ order })

    if (!order || status === "loading")
        return (
            <FullPageMessage>
                <Loader size="xl" />
            </FullPageMessage>
        )

    console.log(order.stage, getStepNumber(order.stage))
    return (
        <Stack sx={{ height: "100%" }}>
            <Stepper active={getStepNumber(order.stage)} breakpoint="sm" allowNextStepsSelect={false}>
                <Stepper.Step allowStepClick={false} label="Авторизация">
                    Введите email и одноразовый пароль
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Персональная информация">
                    Пожалуйста, заполните все данные ниже.
                    Контактные данные и реальные фамилия, имя и отчество необходимы для формирования списков,
                    по которым при входе на мероприятие Вам будут выданы билеты,
                    а также для связи по вопросам купленных билетов.
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Выбор мест">
                    Выбор мест
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Оплата">
                    Оплата
                </Stepper.Step>
                <Stepper.Completed>
                    Заказ завершен
                </Stepper.Completed>
            </Stepper>
            <Container sx={{ flexGrow: 1 }}>
                {order.stage === "authenticate" && <LoginForm callback={nextStage} />}
                {order.stage === "form" && <OrderForm />}
                {order.stage === "tickets" && <TicketsPicker venue={venue} />}
                {order.stage === "payment" && <PaymentForm />}
                {(order.stage === "makeReservation" || order.stage === "complete" || order.stage === "error") && (
                    <FullPageMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 400, alignItems: "center" }}>
                            {order.stage === "makeReservation" && <>
                                <Loader size="lg" />
                                <Text>Бронируем билеты</Text>
                            </>}
                            {order.stage === "complete" && <>
                                <ThemeIcon variant="outline" color="green" size="xl" sx={{ border: 0 }}>
                                    <IconCheck size={40} />
                                </ThemeIcon>
                                <Text>Заказ успешно создан!</Text>
                                <Link href="/orders" passHref legacyBehavior>
                                    <Button variant="subtle">
                                        Посмотреть мои заказы
                                    </Button>
                                </Link>
                            </>}
                            {order.stage === "error" && <>
                                <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                                    <IconAlertTriangle size={40} />
                                </ThemeIcon>
                                <Text>Не удалось забронировать билеты!</Text>
                                <OrderError text={order.error} />
                                <Button
                                    variant="subtle"
                                    onClick={() => setOrder && setOrder(prev => ({
                                        ...prev,
                                        stage: "tickets",
                                        tickets: new Map,
                                        error: undefined
                                    }))
                                    }
                                >
                                    Попробовать еще раз
                                </Button>

                            </>}
                        </Stack>
                    </FullPageMessage>
                )}
            </Container>
        </Stack>
    )
}

export default function MakeOrder(
    { user, venue }:
        { user: (Omit<User, "createdAt"> & { createdAt: string }) | null, venue: (Venue & { rows: TicketRow[] }) | null }
) {
    return (
        <OrderProvider initPaymentData={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            age: user?.age ? String(user.age) : "",
            phone: user?.phone ?? "",
            nickname: user?.nickname ?? "",
            social: user?.social ?? "",
        }}>
            <Scaffolding venue={venue} />
        </OrderProvider>
    )
}