import { ClientOrder } from "@/components/order-make/use-order"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"

export const getUser = async () => {
    const res = await fetch("/api/getUser", {
        method: "GET",
        headers: new Headers({ 'content-type': 'application/json' })
    })

    if (res.ok) {
        return ({ success: true, data: await res.json() })
    } else {
        const response = await res.json()
        return {
            success: false,
            error: "Что-то пошло не так, попробуйте позже"
        }
    }
}

export const getReservedTickets = async () => {
    const res = await fetch("/api/getReservedTickets", {
        method: "GET",
        headers: new Headers({ 'content-type': 'application/json' })
    })

    if (res.ok) {
        return ({ success: true, data: (await res.json()).tickets })
    } else {
        // const response = await res.json()
        return {
            success: false,
            error: "Что-то пошло не так, попробуйте позже"
        }
    }
}

export const sendTickets = async (orderId: Number) => {
    const res = await fetch("/api/sendTickets?orderId=" + orderId, {
        method: "GET",
        headers: new Headers({ 'content-type': 'application/json' })
    })

    if (res.ok) {
        return ({ success: true })
    } else {
        // const response = await res.json()
        return {
            success: false,
            error: "Что-то пошло не так, попробуйте позже"
        }
    }
}

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
            return ({ success: true })
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

    const formData = new FormData
    formData.append('paymentInfo', JSON.stringify(order.paymentData))
    formData.append('tickets', JSON.stringify(
        [...order.tickets].map(([key, value]) => ({ ...value }))
    ))
    order.cheque && formData.append('cheque', order.cheque)

    const res = await fetch("/api/createOrder", {
        method: "POST",
        body: formData
    })

    if (res.ok) {
        return ({ success: true, data: await res.json() })
    } else {
        return ({
            success: false,
            error: (await res.json()).error
        })
    }
}

export const getOrder = async (orderId: number) => {
    const res = await fetch("/api/getOrder?orderId=" + orderId)
    if (res.ok) {
        return ({ success: true, data: await res.json() })
    } else {
        return ({
            success: false,
            error: (await res.json()).error
        })
    }
}

export const uploadCheque = async (orderId: number, cheque: File) => {
    const formData = new FormData
    formData.append("orderId", String(orderId))
    formData.append("cheque", cheque)

    const res = await fetch("/api/uploadCheque", {
        method: "POST",
        body: formData
    })

    if (res.ok) {
        return ({ success: true })
    } else {
        return ({
            success: false,
            error: (await res.json()).error
        })
    }
}

export const setOrderStatus = async (orderId: number, status: OrderStatus) => {
    const res = await fetch("/api/setOrderStatus", {
        method: "POST",
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify({ orderId, status })
    })

    if (res.ok) {
        return ({ success: true })
    } else {
        return {
            success: false,
            error: "Что-то пошло не так попробуйте позже"
        }
    }
}

export const requestReturn = async (orderId: number) => {
    const res = await fetch("/api/requestReturn", {
        method: "POST",
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify({ orderId })
    })

    if (res.ok) {
        return ({ success: true })
    } else {
        return {
            success: false,
            error: "Что-то пошло не так попробуйте позже"
        }
    }
}