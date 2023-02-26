import { ClientOrder } from "@/types/types"
import { z } from "zod"

export const sendPasswordEmail = async (email?: string) => {
    const emailValidator = z.string().email()
    const validated = emailValidator.safeParse(email)
    if (!validated.success)
        return {
            success: false,
            error: "Неправильный формат e-mail"
        }
    else {
        const res = await fetch("/api/sendPassword", {
            method: "POST",
            headers: new Headers({ 'content-type': 'application/json' }),
            // credentials: 'include',
            body: JSON.stringify({ email })
        })

        if (res.ok) {
            return ({success: true})
        } else {
            const response = await res.json()
            if (response?.error === "user_not_found")
                return {
                    success: false,
                    error: "Указанная почта не найдена в системе"
                }
            else
                return {
                    success: false,
                    error: "Что-то пошло не так, попробуйте позже"
                }
        }
    } 
}

export const createOrder = async (order: ClientOrder) => {
    console.log('sending', order)
    const { cheque, ...paymentData } = order.paymentData
    
    const formData = new FormData
    formData.append('paymentInfo', JSON.stringify(paymentData))
    cheque && formData.append('cheque', cheque)
    formData.append('tickets', JSON.stringify(
        [...order.tickets].map(([key, value]) => ({ ...value }))
    ))

    const res = await fetch("/api/createOrder", {
        method: "POST",
        body: formData
    })

    if (res.ok) {
        return ({success: true})
    } else {
        return ({
            success: false,
            error: (await res.json()).error
        })
    }
}