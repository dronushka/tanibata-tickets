import { createOrder, getUser, sendPasswordEmail, uploadCheque } from "@/lib/api-calls"
import { ClientOrder, OrderStage, PaymentData } from "@/types/types"
import { useSession } from "next-auth/react"
import { Context, createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

export const initialOrder: ClientOrder = {
    stage: "authenticate",
    error: undefined,
    paymentData: {
        name: "",
        phone: "",
        email: "",
        age: "",
        nickname: "",
        social: "",
    },
    tickets: new Map(),
    cheque: undefined
}

export type OrderContext = {
    defaultPaymentData?: PaymentData,
    order?: ClientOrder,
    setOrder?: Dispatch<SetStateAction<ClientOrder>>,
    nextStage: (order?: ClientOrder) => void,
    prevStage: () => void
}

export const OrderContext = createContext<OrderContext>({
    defaultPaymentData: undefined,
    order: initialOrder,
    setOrder: undefined,
    nextStage: (order?: ClientOrder) => { },
    prevStage: () => { }
})
// OrderProvider = 


// let OrderContext: Context<OrderContext>
// let OrderProvider: ReactNode

export const OrderProvider = ({ initPaymentData, children }: { initPaymentData: PaymentData, children: ReactNode }) => {
    // const [defaultPaymentData, setDefaultPaymentData] = useState<PaymentData>(initPaymentData)
    const [order, setOrder] = useState<ClientOrder>({ ...initialOrder, paymentData: initPaymentData })

    const setStage = (value: OrderStage, error?: string) => {
        console.log({ error })
        setOrder(prev => ({ ...prev, stage: value, error }))
    }

    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "unauthenticated") setStage("authenticate")

        if (session)
            if (order.stage === "authenticate") setStage("form")
    },
        [session, status])

    const nextStage = async (newOrder?: ClientOrder) => {
        console.log(order.stage)
        if (!order)
            return

        if (newOrder)
            setOrder(newOrder)

        switch (order.stage) {
            case "authenticate":
                const { data: user } = await getUser()
                setOrder(prev => ({
                    ...prev,
                    paymentData: {
                        name: user.name ?? "",
                        email: user.email,
                        phone: user.phone ?? "",
                        age: String(user.age) ?? "",
                        social: user.social ?? ""
                    }
                }))
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
                    else
                        setStage("error", result.error)
                    break
                }
            case "payment":
                newOrder?.orderId && newOrder?.cheque && await uploadCheque(newOrder.orderId, newOrder.cheque)
                setStage("complete")
                break
        }
    }

    const prevStage = () => {
        if (!order)
            return

        switch (order.stage) {
            case "tickets":
                setStage("form")
                break
        }
    }

    return <OrderContext.Provider value={{ order, setOrder, nextStage, prevStage }} >
        {children}
    </OrderContext.Provider>
}

export const useOrder = () => {
    const context = useContext(OrderContext)

    if (context == undefined) {
        throw new Error("useOrder is used outside of the OrderProvider component")
    }

    return {
        ...context
    }
}