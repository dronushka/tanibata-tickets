import { Order, User } from "@prisma/client"
import bcrypt from 'bcryptjs'

export function getSecuritySting(order: Order, user: User) {
    return String(order.id)
    + String(order.createdAt.getTime())
    + String(user.id)
    + String(user.createdAt.getTime())
    + process.env.TICKET_SECRET
}

export function getOrderHash(order: Order, user: User) {
    return bcrypt.hashSync(getSecuritySting(order, user))
}

export function getQRString (order: Order, user: User) {
    return JSON.stringify({
        id: order.id,
        hash: getOrderHash(order, user)
    })
}