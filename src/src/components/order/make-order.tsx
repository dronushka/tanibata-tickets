"use client"

import { Box, Flex } from "@mantine/core"
import { PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useContext, useEffect, useState } from "react"
import LoginForm from "../login-form"
import Hall from "./hall"
import { OrderContext, OrderContextProvider } from "./OrderContext"
import PaymentForm from "./payment-form"
import Stage from "./stage"
import Summary from "./summary"

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
    const { order, setOrder } = useContext(OrderContext)

    const [ showPaymentForm, setShowPaymentForm ] = useState<boolean>(true)
    const [ orderComplete, setOrderComplete ] = useState<boolean>(false)

    useEffect(() => {
        if (order?.isReady && status === 'authenticated') {
            //sendOrder
            setOrderComplete(true)
        }
    }, [order, status])

    console.log('order', order)
    console.log('showPaymentForm', showPaymentForm)
    console.log('orderComplete', orderComplete)

    if (order && !orderComplete)
        return (
            <>
                {!order?.isReady && (
                    <Flex sx={{
                        flexDirection: "row"
                    }}>
                        <Box>
                            {!showPaymentForm && (
                                <>
                                    <Stage />
                                    {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
                                    <Hall rows={clientRows} />
                                </>
                            )}
                            {showPaymentForm && (
                                <PaymentForm />
                            )}
                        </Box>

                        <Flex sx={{
                            alignItems: "center",
                            padding: 20
                        }}>
                            <Summary onPaymentClick={() => setShowPaymentForm(true)} />
                        </Flex>
                    </Flex>
                )}
                {order && order.isReady && status === 'unauthenticated' && (
                    <LoginForm 
                        clientEmail={order.paymentData.email} 
                        callback={() => { setOrder && setOrder(prev => ({ ...prev, isReady: false})) }}
                    />
                )}
            </>
        )
    else if (order && orderComplete)
        return <p>Order complete</p>

    return <p>loading ...</p>

}

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }) {
    return (
        <OrderContextProvider>
            <Scaffolding venue={venue} />
        </OrderContextProvider>
    )
}