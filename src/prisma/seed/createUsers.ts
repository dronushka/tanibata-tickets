import { prisma } from "../../src/lib/db"
import { Role } from "@prisma/client"

export default async function createUsers() {

    await prisma.user.create({
        data: {
            email: "gworlds@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "everilion@gmail.com",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "alpha-rnd@yandex.ru",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "tanibatafest@yandex.ru",
            name: "admin",
            nickname: "admin",
            age: 99,
            role: Role.ADMIN
        }
    })

    await prisma.user.create({
        data: {
            email: "g-worlds@ya.ru",
            name: "Константиновский Константин Константинович",
            nickname: "tester",
            age: 99,
            role: Role.CUSTOMER
        }
    })

}