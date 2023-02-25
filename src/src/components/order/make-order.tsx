"use client"

import { Box, Flex } from "@mantine/core"
import { PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useContext, useEffect, useState } from "react"
import LoginForm from "../login-form"
import Hall from "./hall"
import PaymentForm from "./payment-form"
import Stage from "./stage"
import Summary from "./summary"
import { OrderProvider, useOrder } from "./use-order"

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
    // const { order, setOrder } = useContext(OrderContext)
    const { order, nextStage, prevStage } = useOrder()
    // const { next: nextStage, prev: prevStage } = useOrderRoutine()

    // const [ showPaymentForm, setShowPaymentForm ] = useState<boolean>(true)
    // const [ orderComplete, setOrderComplete ] = useState<boolean>(false)

    const sendOrder = async () => {
        //send Order here
        // setOrder && setOrder({...initialOrder})
        // setOrderComplete(true)
    }

    // useEffect(() => {
    //     if (order?.isReady && status === 'authenticated') {
    //         sendOrder()
    //     }
    // }, [order, status])

    console.log('order', order)

    if (order)
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
                {order.stage === "send" && <p>Creating order ...</p>}
                {order.stage === "complete" && <p>Order complete</p>}
            </>
        )

    return <p>loading ...</p>

}

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }) {
    return (
        <OrderProvider>
            <Scaffolding venue={venue} />
        </OrderProvider>
    )
}