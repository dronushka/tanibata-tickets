import { createOrder, uploadCheque } from "@/lib/api-calls"
import { PriceRange, Ticket } from "@prisma/client"
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
    paymentData: PaymentData,
    tickets: Map<number, Ticket & { priceRange: PriceRange | null }>,
    cheque?: File
}

export const useOrder = (initialOrder: ClientOrder) => {
    const [order, setOrder] = useState<ClientOrder>({ ...initialOrder })

    // useEffect(() => {
    //     setOrder(initialOrder)
    // }, [initialOrder])

    const [stage, setStage] = useState<OrderStage>("authenticate")
    const [error, setError] = useState("")



    const nextStage = async (newOrder?: ClientOrder) => {
        // console.log(order.stage)
        if (!order)
            return

        if (newOrder)
            setOrder(newOrder)

        switch (stage) {
            case "authenticate":
                // const { data: user } = await getUser()
                // setOrder(prev => ({
                //     ...prev,
                //     paymentData: {
                //         name: user.name ?? "",
                //         email: user.email,
                //         phone: user.phone ?? "",
                //         age: String(user.age) ?? "",
                //         social: user.social ?? ""
                //     }
                // }))
                break
            case "form":
                setStage("tickets")
                break
            case "tickets":
                if (newOrder) {
                    setStage("makeReservation")
                    const result = await createOrder(newOrder)
                    if (result.success) {
                        setOrder(prev => ({ ...prev, orderId: result.data.orderId }))
                        setStage("payment")
                    }
                    else {
                        setStage("error")
                        setError(result.error)
                    }
                    break
                }
            case "payment":
                newOrder?.orderId && newOrder?.cheque && await uploadCheque(newOrder.orderId, newOrder.cheque)
                setStage("complete")
                break
        }
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