'use client'

import { ClientOrder } from "@/components/MakeOrder/useOrder"
import { createNoSeatsOrder, createOrder } from "@/lib/api-calls"
import { Ticket } from "@prisma/client"

export default function ClientConcurrencyTest() {
    const startTest = async () => {
        const order1: ClientOrder = {
            paymentData: {
                name: "tester1",
                phone: "123123123",
                email: "g-worlds@ya.ru",
                age: "11",
                social: ""
            },
            tickets: new Map([
                [256, {
                    id: 256,
                    number: "28",
                    order: null,
                    orderId: null,
                    priceRange: { id: 1, price: 1000, name: 'Стандарт', venueId: 1 },
                    priceRangeId: 1,
                    reserved: false,
                    rowNumber: "10",
                    sortNumber: 28,
                    sortRowNumber: 9,
                    venueId: 1
                }],
                [255, {
                    id: 255,
                    number: "28",
                    order: null,
                    orderId: null,
                    priceRange: { id: 1, price: 1000, name: 'Стандарт', venueId: 1 },
                    priceRangeId: 1,
                    reserved: false,
                    rowNumber: "10",
                    sortNumber: 28,
                    sortRowNumber: 9,
                    venueId: 1
                }]
            ]),
            venueId: 1,
            noSeats: false,
            isGoodness: false,
            comment: "",
            ticketCount: 2
        }
        const order2: ClientOrder = {
            paymentData: {
                name: "tester1",
                phone: "123123123",
                email: "g-worlds@ya.ru",
                age: "11",
                social: ""
            },
            tickets: new Map([
                [255, {
                    id: 255,
                    number: "28",
                    order: null,
                    orderId: null,
                    priceRange: { id: 1, price: 1000, name: 'Стандарт', venueId: 1 },
                    priceRangeId: 1,
                    reserved: false,
                    rowNumber: "10",
                    sortNumber: 28,
                    sortRowNumber: 9,
                    venueId: 1
                }],
                [254, {
                    id: 254,
                    number: "28",
                    order: null,
                    orderId: null,
                    priceRange: { id: 1, price: 1000, name: 'Стандарт', venueId: 1 },
                    priceRangeId: 1,
                    reserved: false,
                    rowNumber: "10",
                    sortNumber: 28,
                    sortRowNumber: 9,
                    venueId: 1
                }]
            ]),
            venueId: 1,
            noSeats: false,
            isGoodness: false,
            comment: "",
            ticketCount: 2
        }
        await createOrder(order1).then(res => console.log(res))
        await createOrder(order2).then(res => console.log(res))
    }

    const startTestNoSeats = () => {
        const orders: ClientOrder[] = [
            {
                paymentData: {
                    name: "tester1",
                    phone: "123123123",
                    nickname: "tester",
                    email: "g-worlds@ya.ru",
                    age: "11",
                    social: ""
                },
                tickets: new Map,
                venueId: 2,
                noSeats: false,
                isGoodness: false,
                comment: "",
                ticketCount: 2
            },
            {
                paymentData: {
                    name: "tester1",
                    nickname: "tester",
                    phone: "123123123",
                    email: "g-worlds@ya.ru",
                    age: "11",
                    social: ""
                },
                tickets: new Map,
                venueId: 2,
                noSeats: false,
                isGoodness: false,
                comment: "",
                ticketCount: 2
            },
            {
                paymentData: {
                    name: "tester1",
                    nickname: "tester",
                    phone: "123123123",
                    email: "g-worlds@ya.ru",
                    age: "11",
                    social: ""
                },
                tickets: new Map,
                venueId: 2,
                noSeats: false,
                isGoodness: false,
                comment: "",
                ticketCount: 2
            },
        ]

        createNoSeatsOrder(orders[0])
        createNoSeatsOrder(orders[1])
        createNoSeatsOrder(orders[2])
    }

    return <div>
        <button onClick={startTest}>Start test</button>
        <button onClick={startTestNoSeats}>Start no seats test</button>
    </div>
}