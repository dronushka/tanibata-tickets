import { PriceRange } from "@prisma/client"

export type HallTicket = {
    number: number,
    priceRange?: PriceRange 
}

export type HallTicketRow = { number: number, tickets: HallTicket[] }