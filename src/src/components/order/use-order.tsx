import { createOrder, sendPasswordEmail } from "@/lib/api-calls"
import { ClientOrder, OrderStage, PaymentData } from "@/types/types"
import { useSession } from "next-auth/react"
import { Context, createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

export const initialOrder: ClientOrder = {
    stage: "tickets",
    error: undefined,
    paymentData: {
        name: "",
        phone: "",
        email: "",
        age: "",
        nickname: "",
        social: "",
        cheque: null
    },
    tickets: new Map()
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
    const [ defaultPaymentData, setDefaultPaymentData ] = useState<PaymentData>(initPaymentData)
    const [ order, setOrder] = useState<ClientOrder>({ ...initialOrder, paymentData: initPaymentData })

    const setStage = (value: OrderStage, error?: string) => {
        setOrder(prev => ({ ...prev, stage: value, error }))
    }

    const { data: session, status } = useSession()

    // useEffect(() => {
    //     if (session)
    //         setOrder(prev => ({
    //             ...prev,
    //             paymentData: {...session.user, cheque: null}
    //         }))
    // }, 
    // [session])

    const nextStage = async (newOrder?: ClientOrder) => {
        if (!order)
            return

        if (newOrder)
            setOrder(newOrder)

        switch (order.stage) {
            case "tickets":
                setStage("form")
                break
            case "form":
                if (status !== "authenticated") {
                    console.log('sending password to ', newOrder?.paymentData.email)
                    sendPasswordEmail(newOrder?.paymentData.email)
                    setStage("authenticate")
                } else {
                    // debugger
                    setStage("send")
                    console.log('sending order')
                    if (newOrder) {
                        const result = await createOrder(newOrder)
                        if (result.success)
                            setStage("complete")
                        else
                            setStage("error", result.error)
                    }
                }
                break
            case "authenticate":
                setStage("send")
                console.log('sending order')
                if (newOrder) {
                    const result = await createOrder(newOrder)
                    if (result.success)
                        setStage("complete")
                    else
                        setStage("error", result.error)
                }
                break
            case "send":
                setStage("complete")
                setOrder({ ...initialOrder })
                break
        }
    }

    const prevStage = () => {
        if (!order)
            return

        switch (order.stage) {
            case "authenticate":
                setStage("form")
                break
            case "form":
                setStage("tickets")
                break
        }
    }

    return <OrderContext.Provider value={{ defaultPaymentData, order, setOrder, nextStage, prevStage }} >
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