"use client"

import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, ThemeIcon } from "@mantine/core"
import { PriceRange, Row, Ticket, User, Venue } from "@prisma/client"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import FullPageMessage from "../full-page-message"
import LoginForm from "../login-form"
import Hall from "./hall"
import OrderError from "./order-error"
import PaymentForm from "./payment-form"
import Stage from "./stage"
import Summary from "./summary"
import { OrderProvider, useOrder } from "./use-order"

function Scaffolding(
    { user, venue }: 
    { user?: User | null, venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }
) {
    const clientRows = venue?.rows.map(
        row => (
            {
                ...row,
                tickets: row.tickets.map(
                    ticket => (
                        {
                            ...ticket,
                            rowNumber: String(row.number)
                        }
                    )
                )
            }
        )
    )


    const { status } = useSession()

    const { order, nextStage, prevStage, setOrder } = useOrder()

    console.log(order?.error)
    if (status !== "loading" && order)
        return (
            <>
                {(order.stage === "tickets" || order.stage === "form") && (
                    <Flex sx={{
                        flexDirection: "row"
                    }}>
                        <Box>
                            {order.stage === "tickets" && (
                                <>
                                    <Stage />
                                    <Hall rows={clientRows} />
                                </>
                            )}
                            {order.stage === "form" && (
                                <PaymentForm />
                            )}
                        </Box>

                        <Flex sx={{
                            alignItems: "center",
                            padding: 20
                        }}>
                            <Summary />
                        </Flex>
                    </Flex>
                )}
                {order.stage === "authenticate" && (
                    <LoginForm
                        clientEmail={order.paymentData.email}
                        callback={nextStage}
                        rollback={prevStage}
                    />
                )}
                {(order.stage === "send" || order.stage === "complete" || order.stage === "error") && (
                    <FullPageMessage>
                        <Stack sx={{ minWidth: 250, maxWidth: 400, alignItems: "center" }}>
                            {order.stage === "send" && <>
                                <Loader size="lg" />
                                <Text>Заказ создается</Text>
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
                                <Text>Ошибка создания заказа!</Text>
                                <OrderError text={order.error} />
                                <Button 
                                    variant="subtle"
                                    onClick={() => setOrder && setOrder(prev => ({
                                            ...prev,
                                            stage: "tickets",
                                            tickets: new Map
                                        }))
                                    }
                                >
                                    Начать заново
                                </Button>
                                
                            </>}
                        </Stack>
                    </FullPageMessage>
                )}
            </>
        )

    return (
        <FullPageMessage>
            <Loader size="xl" />
        </FullPageMessage>
    )
}

export default function MakeOrder(
    { user, venue }:
    { user?: User, venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }
) {   
    return (
        <OrderProvider initPaymentData={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            age: user?.age ? String(user.age) : "",
            phone: user?.phone ?? "",
            nickname: user?.nickname ?? "",
            social: user?.social ?? "",
            cheque: null
        }}>
            <Scaffolding venue={venue} />
        </OrderProvider>
    )
}