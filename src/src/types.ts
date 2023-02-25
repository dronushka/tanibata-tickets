import { PriceRange, Row, Ticket } from "@prisma/client"
import { z } from "zod"

export type ClientTicket = Ticket & { 
    rowNumber: string,
    priceRange: PriceRange
}

export type TicketRow = Row & { tickets: ClientTicket[]}
// export type ClientOrder = {
//     tickets: ClientTicket[]
// } | null

// export type ClientOrder = {
//     tickets: { [id: number]: ClientTicket }
// } | null

export const paymentDataSchema = z.object({
    name: z.string().min(1, "Введите имя"),
    phone: z.string().min(10, "Введите телефон").max(10),
    email: z.string().email("Введите корректный e-mail"),
    age: z.string().regex(/^\d+$/, "Введите возраст"),
    nickname: z.string().optional(),
    social: z.string().optional(),
    // cheque: z.instanceof(File, "Приложите файл")
    cheque: z.custom<File>(val => val instanceof File, "Приложите файл")
})

export type PaymentDataSchema = z.infer<typeof paymentDataSchema>

export type PaymentData = Omit<PaymentDataSchema, 'cheque'> & {cheque: File | null}

export type ClientOrder = {
    isReady: boolean,
    paymentData: PaymentData,
    tickets: Map<number,ClientTicket>
}