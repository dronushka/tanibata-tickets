import { ClientOrder, OrderStage } from "@/types"
import { useSession } from "next-auth/react"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { sendPasswordEmail } from "../login-form"

export const initialOrder: ClientOrder = {
    stage: "tickets",
    isReady: false,
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

const OrderContext = createContext<{ 
    order?: ClientOrder,
    setOrder?: Dispatch<SetStateAction<ClientOrder>>,
    nextStage: (order?: ClientOrder) => void,
    prevStage: () => void
}>({
    order: undefined,
    setOrder: undefined,
    nextStage: (order?: ClientOrder) => {},
    prevStage: () => {}
})

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [ order, setOrder ] = useState<ClientOrder>({ ...initialOrder })

    const setStage = (value: OrderStage) => {
        setOrder(prev => ({ ...prev, stage: value}))
    }

    const { status } = useSession()

    const nextStage = (newOrder?: ClientOrder) => {
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
                    console.log('sending password to ', order?.paymentData.email )
                    sendPasswordEmail(order?.paymentData.email)
                    setStage("authenticate")
                } else {
                    // debugger
                    setStage("send")
                    console.log('sending order')
                    setStage("complete")
                }
            break
            case "authenticate":
                setStage("send")
                console.log('sending order')
                setStage("complete")
            break
            case "send":
                setStage("complete")
                setOrder({...initialOrder})
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