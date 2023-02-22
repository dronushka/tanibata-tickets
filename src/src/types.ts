import { Row, Ticket } from "@prisma/client"

// export type ClientTicket = {
//     rowNumber: number,
//     ticketId: number
// }

export type ClientOrder = {
    tickets: ClientTicket[]
} | null

export type ClientTicket = Ticket & { 
    selected: boolean,
    rowNumber: string
}

export type ClientRow = Row & { tickets: ClientTicket[]}