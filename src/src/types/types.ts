import { Order, PriceRange, Row, Ticket, Venue } from "@prisma/client"
import { z } from "zod"

export type ClientTicket = Ticket & { 
    rowNumber: string,
    priceRange: PriceRange
}

export type TicketRow = Row & { tickets: ClientTicket[]}

export type ClientVenue = Venue & { rows: TicketRow[] } | null

export const paymentDataSchema = z.object({
    name: z.string().min(1, "Введите имя"),
    phone: z.string().min(10, "Введите телефон").max(10),
    email: z.string().email("Введите корректный e-mail"),
    age: z.string().regex(/^\d+$/, "Введите возраст"),
    nickname: z.string().optional(),
    social: z.string().optional()
})

export type PaymentData = z.infer<typeof paymentDataSchema>

export type OrderStage = "authenticate" | "form" | "tickets" | "makeReservation" | "payment" | "complete" | "error"

export type ClientOrder = {
    orderId?: number,
    stage: OrderStage,
    error?: string,
    paymentData: PaymentData,
    tickets: Map<number,ClientTicket>,
    cheque?: File
}

export type OrderStatus = "pending" | "complete" | "returnRequested" | "returned"

export type DashboardOrder = Omit<Order, "createdAt"> & {
    createdAt: string,
    paymentData: PaymentData,
    cheque: File | null,
    tickets: (Ticket & {
        row: Row,
        priceRange: PriceRange
    })[]
}