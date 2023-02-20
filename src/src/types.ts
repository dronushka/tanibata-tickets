export type ClientTicket = {
    rowNumber: number,
    ticketId: number
}

export type ClientOrder = {
    tickets: ClientTicket[]
} | null