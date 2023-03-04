import { PaymentData } from "@/components/order-make/use-order"
import { File as DBFile, Order, PriceRange, Row, SentTicket, Ticket, Venue } from "@prisma/client"
import { z } from "zod"

export type DashboardOrder = Omit<Order, "createdAt"> & {
    createdAt: string,
    paymentData: PaymentData,
    cheque: DBFile | null,
    sentTickets: (Omit<SentTicket, "sentAt"> & { sentAt: string})[],
    tickets: (Ticket & {
        row: Row,
        priceRange: PriceRange
    })[]
}