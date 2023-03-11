"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { PriceRange, Ticket, Venue } from "@prisma/client"
import Link from "next/link"
import { Button, Flex, Loader, Stack, Stepper, Text, ThemeIcon } from "@mantine/core"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import FullAreaMessage from "../FullAreaMessage"
import LoginForm from "../LoginForm"
import OrderError from "./OrderError"
import OrderForm from "./OrderForm"
import PaymentForm from "./PaymentForm"
import TicketsPicker from "./TicketsPicker/TicketsPicker"
import TicketsForm from "./TicketsForm"
import { ClientOrder, OrderStage, PaymentData, TicketRow, useOrder } from "./useOrder"

export const getStepNumber = (step?: OrderStage) => {
    const stages = ["authenticate", "form", "tickets", "payment", "complete"]
    return stages.findIndex(s => s === step)
}

export default function MakeOrder(
    { venue, rows }:
        {
            venue: (Omit<Venue, "start"> & { start: string, priceRange: PriceRange[] }),
            rows: Record<string, (Ticket & { priceRange: PriceRange | null })[]>
        }
) {
    const initialOrder: ClientOrder = {
        venueId: venue.id,
        noSeats: venue.noSeats,
        isGoodness: false,
        comment: "",
        paymentData: {
            name: "",
            email: "",
            age: "",
            phone: "",
            nickname: "",
            social: ""
        },
        ticketCount: 0,
        tickets: new Map(),
        cheque: undefined
    }

    const { order, setOrder, stage, setStage, nextStage, prevStage, error } = useOrder(initialOrder)

    const { data: session, status } = useSession()

    useEffect(() => {
        if (!setStage || !setOrder)
            return

        if (status === "unauthenticated")
            setStage("authenticate")

        if (status === "authenticated" && stage === "authenticate") {
            setStage("form")
            // setOrder(prev => ({
            //     ...prev,
            //     paymentData: session.user.paymentData
            // }))
        }
    }, [status, session, stage, setStage, setOrder])

    return (
        <Stack sx={{ height: "100%" }}>
            <Stepper active={getStepNumber(stage)} breakpoint="sm" allowNextStepsSelect={false}>
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

            <Flex sx={{ flexGrow: 1, marginBottom: 50 }}>
                {stage === "authenticate" && <LoginForm callback={() => nextStage()} />}
                {stage === "form" && <OrderForm onSubmit={nextStage} />}
                {stage === "tickets" && venue.noSeats === false && (
                    <TicketsPicker
                        venue={venue}
                        rows={rows}
                        prevStage={prevStage}
                        nextStage={nextStage}
                    />
                )}
                {stage === "tickets" && venue.noSeats === true && (
                    <TicketsForm
                        venue={venue}
                        // reservedTicketCount={reservedTicketCount}
                        // order={order}
                        prevStage={prevStage}
                        nextStage={nextStage}
                    />
                )}
                {stage === "payment" && <PaymentForm order={order} onSubmit={nextStage} />}
                {(stage === "makeReservation" || stage === "complete" || stage === "error") && (
                    <FullAreaMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                            {stage === "makeReservation" && <>
                                <Loader size="lg" />
                                <Text>Бронируем билеты</Text>
                            </>}
                            {stage === "complete" && <>
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
                            {stage === "error" && <>
                                <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                                    <IconAlertTriangle size={40} />
                                </ThemeIcon>
                                <Text>Не удалось забронировать билеты!</Text>
                                <OrderError text={error} />
                                <Button
                                    variant="subtle"
                                    onClick={() => {
                                        setStage("tickets")
                                        setOrder(prev => ({
                                            ...prev,
                                            tickets: new Map,
                                            error: undefined
                                        }))
                                    }
                                    }
                                >
                                    Попробовать еще раз
                                </Button>

                            </>}
                        </Stack>
                    </FullAreaMessage>
                )}
            </Flex>
        </Stack>
    )
}