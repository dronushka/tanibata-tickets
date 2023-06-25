import { Prisma, Venue } from "@prisma/client"
import { HallTicketRow } from "./types"

export default function getShowTickets (venue: Venue, rows: HallTicketRow[]) {
    const tickets: Prisma.Enumerable<Prisma.TicketCreateManyInput> = []
    
    for (let row of rows) {
        for (let ticket of row.tickets) {
            const t: any = {
                venueId: venue.id,
                rowNumber: String(row.number),
                sortRowNumber: row.number,
                number: String(ticket.number),
                sortNumber: ticket.number,
            }
            if (ticket.priceRange) {
                t.reserved = false
                t.priceRangeId = ticket.priceRange.id
            } else {
                t.reserved = true
            }
            tickets.push(t)
        }
    } 
    return tickets

}