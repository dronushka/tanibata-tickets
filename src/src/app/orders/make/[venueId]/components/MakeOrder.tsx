"use client"

import { useEffect } from "react"
import { PriceRange, Ticket, Venue } from "@prisma/client"
import Link from "next/link"
import { Button, Flex, Loader, Stack, Stepper, Text, ThemeIcon } from "@mantine/core"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import FullAreaMessage from "@/components/FullAreaMessage"
import LoginForm from "@/components/LoginForm"
import OrderError from "./OrderError"
import OrderForm from "./OrderForm"
import PaymentForm from "./PaymentForm"
import TicketsPicker from "./TicketsPicker/TicketsPicker"
import TicketsForm from "./TicketsForm"
import { ClientOrder, OrderStage, PaymentData, TicketRow, useOrder } from "../hooks/useOrder"
import FullAreaLoading from "@/components/FullAreaLoading"
import { ServerAction } from "@/types/types"
import OrderStepper from "./OrderStepper"
// import { getPaymentData } from "@/lib/api-calls"

type Mutations = {
    createOrder: ServerAction
    payOrder: ServerAction
}

export default function MakeOrder({
    initialOrder,
    venue,
    rows,
    reservedTickets,
    mutations,
}: {
    initialOrder: Omit<ClientOrder, "tickets">
    venue: Omit<Venue, "start"> & { start: string; priceRange: PriceRange[] }
    rows: Record<string, (Ticket & { priceRange: PriceRange | null })[]>
    reservedTickets: number[] | number
    mutations: Mutations
}) {
    // const initialOrder: ClientOrder = {
    //     venueId: venue.id,
    //     noSeats: venue.noSeats,
    //     isGoodness: false,
    //     comment: "",
    //     paymentData,
    //     ticketCount: 0,
    //     tickets: new Map(),
    //     cheque: undefined
    // }

    const { order, setOrder, stage, transition, isPending, setStage, nextStage, prevStage, error } = useOrder(
        initialOrder,
        mutations
    )

    return (
        <Stack sx={{ height: "100%" }}>
            <OrderStepper stage={stage} isPending={isPending} noSeats={venue.noSeats} />

            <Flex sx={{ flexGrow: 1, marginBottom: 50 }}>
                {isPending && <FullAreaLoading />}
                {!isPending && (
                    <>
                        {stage === "authenticate" && <LoginForm />}
                        {stage === "form" && <OrderForm data={order.paymentData} onSubmit={nextStage} />}
                        {stage === "tickets" && venue.noSeats === false && (
                            <TicketsPicker
                                venue={venue}
                                rows={rows}
                                reservedTickets={Array.isArray(reservedTickets) ? reservedTickets : []}
                                prevStage={prevStage}
                                nextStage={nextStage}
                            />
                        )}
                        {stage === "tickets" && venue.noSeats === true && (
                            <TicketsForm
                                venue={venue}
                                reservedTicketCount={typeof reservedTickets === "number" ? reservedTickets : 0}
                                // order={order}
                                prevStage={prevStage}
                                nextStage={nextStage}
                            />
                        )}
                        {stage === "payment" && <PaymentForm venue={venue} order={order} onSubmit={nextStage} />}
                        {(stage === "makeReservation" || stage === "complete" || stage === "error") && (
                            <FullAreaMessage>
                                <Stack
                                    sx={{
                                        minWidth: 250,
                                        maxWidth: 300,
                                        alignItems: "center",
                                    }}
                                >
                                    {stage === "makeReservation" && (
                                        <>
                                            <Loader size="lg" />
                                            <Text>Бронируем билеты</Text>
                                        </>
                                    )}
                                    {stage === "complete" && (
                                        <>
                                            <ThemeIcon variant="outline" color="green" size="xl" sx={{ border: 0 }}>
                                                <IconCheck size={40} />
                                            </ThemeIcon>
                                            <Text>Заказ успешно создан!</Text>
                                            <Link href="/orders" passHref legacyBehavior>
                                                <Button variant="subtle">Посмотреть мои заказы</Button>
                                            </Link>
                                        </>
                                    )}
                                    {stage === "error" && (
                                        <>
                                            <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                                                <IconAlertTriangle size={40} />
                                            </ThemeIcon>
                                            <Text>Не удалось забронировать билеты!</Text>
                                            <OrderError text={error} />
                                            <Button
                                                variant="subtle"
                                                onClick={() => {
                                                    setStage("tickets")
                                                    setOrder((prev) => ({
                                                        ...prev,
                                                        tickets: new Map(),
                                                        error: undefined,
                                                    }))
                                                }}
                                            >
                                                Попробовать еще раз
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </FullAreaMessage>
                        )}
                    </>
                )}
            </Flex>
        </Stack>
    )
}
