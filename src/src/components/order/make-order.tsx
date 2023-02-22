"use client"

import { ClientOrder } from "@/types"
import { PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { json } from "stream/consumers"
import Hall from "../hall"
import { OrderContext, OrderContextProvider } from "./OrderContext"

export default function MakeOrder({ venue }: { venue: Venue & { rows: (Row & { tickets: (Ticket & { priceRange: PriceRange})[] })[] } | null }) {

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
    

    console.log(clientRows)
    
    return (
        <OrderContextProvider>
            {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
            <Hall rows={clientRows} />
        </OrderContextProvider>
    )
}