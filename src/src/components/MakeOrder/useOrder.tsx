import { createNoSeatsOrder, createOrder, setPaymentInfo, uploadCheque } from "@/lib/api-calls"
import { Order, PriceRange, Ticket } from "@prisma/client"
import { useState } from "react"
import { z } from "zod"

export type OrderStage = "authenticate" | "form" | "tickets" | "makeReservation" | "payment" | "complete" | "error"

export type TicketRow = {
    number: string,
    tickets: (Ticket & { priceRange: PriceRange | null })[]
}

export const paymentDataSchema = z.object({
    name: z.string().min(1, "Введите имя").refine(value => value.trim().split(' ').length >= 2, "Введите полностью фамилию, имя и отчество"),
    phone: z.string().min(10, "Введите телефон").max(10),
    email: z.string().email("Введите корректный e-mail"),
    age: z.string().regex(/^\d+$/, "Введите возраст"),
    nickname: z.string().optional(),
    social: z.string().superRefine((val, ctx) => {
        const re = new RegExp(/^https:\/\/vk\.com\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]+$/)

        if (val.length > 0 && !re.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Адрес не распознан",
              fatal: true
            })
  
            return z.NEVER
          }
    })
})

export type PaymentData = z.infer<typeof paymentDataSchema>

export type ClientOrder = {
    orderId?: number,
    venueId: number,
    noSeats: boolean,
    isGoodness: boolean,
    comment: string,
    paymentData: PaymentData,
    ticketCount: number,
    tickets: Map<number, Ticket & { priceRange: PriceRange | null }>,
    cheque?: File
}

// export type OrderSetter = ClientOrder | ((newOrder: ClientOrder) => ClientOrder) | undefined
export const useOrder = (initialOrder: ClientOrder) => {
    const [order, setOrder] = useState<ClientOrder>({ ...initialOrder })
    const [stage, setStage] = useState<OrderStage>("authenticate")
    const [error, setError] = useState("")

    // const f = (n: string) => (f: string) => 
    const doNextStage = async (newOrder?: ClientOrder) => {
        if (!order)
            return

        if (newOrder)
            setOrder(newOrder)

        switch (stage) {
            case "authenticate":
                break
            case "form":
                setStage("tickets")
                break
            case "tickets":
                if (newOrder) {
                    setStage("makeReservation")
                    const result = newOrder.noSeats ? await createNoSeatsOrder(newOrder) : await createOrder(newOrder)
                    if (result.success) {
                        setOrder(prev => ({ ...prev, orderId: result.data.orderId }))
                        setStage("payment")
                    } else {
                        setStage("error")
                        setError(result.error)
                    }
                    break
                }
            case "payment":
                newOrder?.orderId 
                && newOrder?.cheque
                && await setPaymentInfo(newOrder.orderId, newOrder.isGoodness, newOrder.comment, newOrder.cheque)
                setStage("complete")
                break
        }
    }

    const nextStage = (orderSetter?: ClientOrder | ((newOrder: ClientOrder) => ClientOrder)) => {
        let newOrder: ClientOrder | undefined = undefined
        if (typeof orderSetter === "function")
            newOrder = orderSetter(order)
        else if (typeof orderSetter === "object")
            newOrder = orderSetter

        doNextStage(newOrder)
    }

    const prevStage = () => {
        switch (stage) {
            case "tickets":
                setStage("form")
                break
        }
    }

    return { order, setOrder, stage, setStage, nextStage, prevStage, error }
}