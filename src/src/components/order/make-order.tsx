"use client"

import { ClientOrder } from "@/types"
import { Row, Ticket, Venue } from "@prisma/client"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { json } from "stream/consumers"
import Hall from "../hall"
import { OrderContext, OrderContextProvider } from "./OrderContext"

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: Ticket[] })[] } | null }) {

    const clientRows = venue?.rows.map(
            row => (
                {
                    ...row,
                    tickets: row.tickets.map(
                        ticket => (
                            {
                                ...ticket,
                                selected: false,
                                rowNumber: String(row.number)
                            }
                        )
                    )
                }
            )
        )
    


    return (
        <OrderContextProvider>
            {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
            <Hall rows={clientRows} />
        </OrderContextProvider>
    )
}