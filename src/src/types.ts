import { PriceRange, Row, Ticket } from "@prisma/client"

export type ClientTicket = Ticket & { 
    rowNumber: string,
    priceRange: PriceRange
}

export type ClientRow = Row & { tickets: ClientTicket[]}
// export type ClientOrder = {
//     tickets: ClientTicket[]
// } | null

// export type ClientOrder = {
//     tickets: { [id: number]: ClientTicket }
// } | null

export type ClientOrder = {
    tickets: Map<number,ClientTicket>
} | null