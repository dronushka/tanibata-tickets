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
import FullAreaLoading from "../FullAreaLoading"

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

    const { order, setOrder, stage, transition, setStage, nextStage, prevStage, error } = useOrder(initialOrder)

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
    console.log(transition, stage)
    return (
        <Stack sx={{ height: "100%" }}>
            <Stepper active={getStepNumber(stage)} breakpoint="sm" allowNextStepsSelect={false}>
                <Stepper.Step allowStepClick={false} label="Авторизация">
                    Введите email и одноразовый пароль
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Персональная информация">
                    {!transition && <>
                        <Text>
                            При оплате со своей банковской карты просим при авторизации вводить ваше реальное ФИО,
                            это необходимо для успешной идентификации платежа.
                        </Text>
                        <Text>
                            Просим также указывать актуальный номер телефона - лучше, если он привязан к банковской карте,
                            с которой производится платеж.
                        </Text>
                        <Text>
                            Также неплохо заполнить адрес страницы VK, если она есть.
                            Из опыта прошлых фестивалей - это самый оперативный способ связи со зрителями при необходимости {";)"}
                        </Text>
                        <Text>
                            Если оплата производится с банковской карты, зарегистрированной на другого человека,
                            ФИО фактического посетителя можно сообщить
                            в поле &quot;ФИО&quot;. В поле &quot;Комментарий&quot;
                            в этом случае нужно вписывать ФИО владельца банковской карты.
                        </Text>
                        <Text>
                            Вот еще одна причина указывать правильные данные - по правилам проведения мероприятий
                            на площадке Областного Дома Народного Творчества, нам нужно составить списки зрителей,
                            по которым они будут допускаться на территорию фестиваля.
                            Чтобы поход на Нян-Фест прошел успешно и не был омрачен досадными случайностями,
                            просим следовать нашей инструкции и не забыть взять с собой на фестиваль оригинал паспорта
                            или свидетельства о рождении.
                        </Text>
                    </>}
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
                {transition && <FullAreaLoading />}
                {!transition && stage === "authenticate" && <LoginForm callback={() => nextStage()} />}
                {!transition && stage === "form" && <OrderForm onSubmit={nextStage} />}
                {!transition && stage === "tickets" && venue.noSeats === false && (
                    <TicketsPicker
                        venue={venue}
                        rows={rows}
                        prevStage={prevStage}
                        nextStage={nextStage}
                    />
                )}
                {!transition && stage === "tickets" && venue.noSeats === true && (
                    <TicketsForm
                        venue={venue}
                        // reservedTicketCount={reservedTicketCount}
                        // order={order}
                        prevStage={prevStage}
                        nextStage={nextStage}
                    />
                )}
                {!transition && stage === "payment" && <PaymentForm venue={venue} order={order} onSubmit={nextStage} />}
                {(!transition && stage === "makeReservation" || !transition && stage === "complete" || !transition && stage === "error") && (
                    <FullAreaMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 300, alignItems: "center" }}>
                            {!transition && stage === "makeReservation" && <>
                                <Loader size="lg" />
                                <Text>Бронируем билеты</Text>
                            </>}
                            {!transition && stage === "complete" && <>
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
                            {!transition && stage === "error" && <>
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