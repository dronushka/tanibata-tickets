import { PaymentDataForm, ServerAction } from "@/types/types"
import { PriceRange, Ticket } from "@prisma/client"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export type OrderStage = "authenticate" | "form" | "tickets" | "makeReservation" | "payment" | "complete" | "error"

export type TicketRow = {
    number: string
    tickets: (Ticket & { priceRange: PriceRange | null })[]
}

export const paymentDataSchema = z.object({
    name: z
        .string()
        .min(1, "Введите имя")
        .refine((value) => value.trim().split(" ").length >= 2, "Введите полностью фамилию, имя и отчество"),
    phone: z.string().min(10, "Введите телефон").max(19),
    email: z.string().email("Введите корректный e-mail"),
    age: z.string().regex(/^\d+$/, "Введите возраст"),
    nickname: z.string().optional(),
    social: z.string().superRefine((val, ctx) => {
        const re = new RegExp(/^https:\/\/vk\.com\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]+$/)

        if (val.length > 0 && !re.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Адрес не распознан",
                fatal: true,
            })

            return z.NEVER
        }
    }),
})

export type PaymentData = z.infer<typeof paymentDataSchema>

export type ClientOrder = {
    orderId?: number
    venueId: number
    noSeats: boolean
    isGoodness: boolean
    comment: string
    paymentData: PaymentData
    ticketCount: number
    tickets: Map<number, Ticket & { priceRange: PriceRange | null }>
    cheque?: File
}

// export type OrderSetter = ClientOrder | ((newOrder: ClientOrder) => ClientOrder) | undefined
export const useOrder = (
    initialOrder: Omit<ClientOrder, "tickets">,
    mutations: {
        createOrder: ServerAction
        payOrder: ServerAction
    }
) => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [transition, transitionTo] = useState<OrderStage | null>(null)
    const [order, setOrder] = useState<ClientOrder>({
        ...initialOrder,
        tickets: new Map(),
        cheque: undefined,
    })
    const [stage, setStage] = useState<OrderStage>("authenticate")
    const [error, setError] = useState("")

    const nextStage = (orderSetter?: ClientOrder | ((newOrder: ClientOrder) => ClientOrder)) => {
        let newOrder: ClientOrder | undefined = undefined
        if (typeof orderSetter === "function") newOrder = orderSetter(order)
        else if (typeof orderSetter === "object") newOrder = orderSetter

        doNextStage(newOrder)
    }

    const prevStage = () => {
        switch (stage) {
            case "tickets":
                transitionTo("form")
                break
        }
    }

    useEffect(() => {
        if (status === "unauthenticated" && stage !== "authenticate") setStage("authenticate")

        if (status === "authenticated" && stage === "authenticate") {
            nextStage()
        }
    }, [status, stage])

    useEffect(() => {
        if (transition) {
            startTransition(() => {
                setStage(transition)
                transitionTo(null)
            })
        }
    }, [transition])
    // const f = (n: string) => (f: string) =>
    const doNextStage = async (newOrder?: ClientOrder) => {
        if (!order) return

        if (newOrder) setOrder(newOrder)

        switch (stage) {
            case "authenticate":
                transitionTo("form")
                startTransition(() => router.refresh())
                break
            case "form":
                transitionTo("tickets")
                startTransition(() => router.refresh())
                break
            case "tickets":
                if (newOrder) {
                    transitionTo("makeReservation")
                    startTransition(async () => {
                        // const result = newOrder.noSeats ? await createNoSeatsOrder(newOrder) : await mutations.createOrder(newOrder)
                        const result = !newOrder.noSeats
                            ? await mutations.createOrder({
                                  ...newOrder,
                                  tickets: [...newOrder.tickets.values()].map((ticket) => ticket.id),
                              })
                            : await mutations.createOrder({ ...newOrder, tickets: undefined })

                        if (result.success) {
                            setOrder((prev) => ({
                                ...prev,
                                orderId: result.data,
                            }))
                            transitionTo("payment")
                        } else {
                            transitionTo("error")
                            setError(result.errors?.server?.join(", ") ?? "")
                        }
                    })
                }
            case "payment":
                if (newOrder?.orderId && newOrder?.cheque) {
                    startTransition(async () => {
                        const form: PaymentDataForm = new FormData()
                        form.append("orderId", String(newOrder.orderId))
                        form.append("goodness", newOrder.isGoodness ? "1" : "")
                        form.append("comment", newOrder.comment)
                        newOrder?.cheque && form.append("cheque", newOrder.cheque)
                        const result = await mutations.payOrder(form)
                        if (result.success) transitionTo("complete")
                        else {
                            // transitionTo("error")
                            setError(result.errors?.server?.join(", ") ?? "")
                        }
                    })
                    // && await setPaymentInfo(newOrder.orderId, newOrder.isGoodness, newOrder.comment, newOrder.cheque)
                }
                break
            default:
                transitionTo("authenticate")
        }
    }



    return {
        order,
        setOrder,
        stage,
        transition,
        isPending,
        setStage: transitionTo,
        nextStage,
        prevStage,
        error,
    }
}
