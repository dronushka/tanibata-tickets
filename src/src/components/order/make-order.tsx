"use client"

import { ClientOrder } from "@/types"
import { Box, Flex } from "@mantine/core"
import { PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { json } from "stream/consumers"
import Hall from "./hall"
import { OrderContext, OrderContextProvider } from "./OrderContext"
import PaymentForm from "./payment-form"
import Stage from "./stage"
import Summary from "./summary"

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange })[] })[] } | null }) {

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

    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(true)

    console.log(showPaymentForm)

    return (
        <>
            <OrderContextProvider>
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
            </OrderContextProvider>

        </>
    )
}