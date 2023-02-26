"use client"

import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, ThemeIcon } from "@mantine/core"
import { PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { IconCheck } from "@tabler/icons-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import LoginForm from "../login-form"
import Hall from "./hall"
import PaymentForm from "./payment-form"
import Stage from "./stage"
import Summary from "./summary"
import { initialOrder, OrderProvider, useOrder } from "./use-order"

function Scaffolding({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }) {
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


    const { data: session, status } = useSession()

    const { order, nextStage, prevStage } = useOrder()

    const sendOrder = async () => {
        //send Order here
        // setOrder && setOrder({...initialOrder})
        // setOrderComplete(true)
    }

    // console.log('order', order)
    // console.log(session?.user)
    // console.log(session?.user ? session.user : initialOrder.paymentData)

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
                                    {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
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
                {(order.stage === "send" || order.stage === "complete") && (
                    <Flex sx={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Paper shadow="xs" p="md">
                            <Stack sx={{ minWidth: 250, maxWidth: 400, alignItems: "center" }}>
                                {order.stage === "send" && <>
                                    <Loader size="lg" />
                                    <Text>Заказ создается</Text>
                                </>}
                                {order.stage === "complete" && <>
                                    <ThemeIcon variant="outline" color="green" size="xl" sx={{border: 0}}>
                                        <IconCheck size="xl"/>
                                    </ThemeIcon>
                                    <Text>Заказ успешно создан!</Text>
                                    <Link href="/orders" passHref legacyBehavior>
                                        <Button variant="subtle">
                                            Посмотреть мои заказы
                                        </Button>
                                    </Link>
                                </>}
                            </Stack>
                        </Paper>
                    </Flex>
                )}
            </>
        )

    return <Loader size="xl"/>

}

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }) {
    return (
        <OrderProvider>
            <Scaffolding venue={venue} />
        </OrderProvider>
    )
}