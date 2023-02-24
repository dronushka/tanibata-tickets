import { ClientOrder } from "@/types"
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react"


export const OrderContext = createContext<{ order?: ClientOrder, setOrder?: Dispatch<SetStateAction<ClientOrder>> }>({
    order: undefined,
    setOrder: undefined
})

export const OrderContextProvider = ({children}: {children: ReactNode}) => {
    const [order, setOrder] = useState<ClientOrder>({
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
    })
    
    return <OrderContext.Provider value={{order, setOrder}} >{children}</OrderContext.Provider>
}
    // <OrderContext.Provider value={{ order, setOrder }}></