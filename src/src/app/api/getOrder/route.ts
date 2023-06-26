import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { z, ZodError } from "zod"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSecurityString } from "@/lib/OrderQR"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== Role.ADMIN) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const validator = z.object({
        id: z.number(),
        hash: z.string(),
    })

    const { searchParams } = new URL(request.url)

    try {
        const validated = validator.parse({
            id: Number(searchParams.get("id")),
            hash: searchParams.get("hash"),
        })

        const order = await prisma.order.findUnique({
            where: { id: validated.id },
            include: {
                user: true,
                venue: true,
                tickets: true,
            },
        })

        if (!order) throw new Error("order_not_found")

        // const hash = getOrderHash(order, order.user)
        // const authString = String(order.id) + String(order.createdAt.getTime()) + String(order.user.id) + String(order.user.createdAt.getTime())
        if (bcrypt.compareSync(getSecurityString(order, order.user), validated.hash)) {
            return NextResponse.json({
                ...order,
                createdAt: order.createdAt.toLocaleString("ru-RU"),
                user: {
                    ...order.user,
                    createdAt: order.user.createdAt.toLocaleString("ru-RU"),
                },
                venue: {
                    ...order.venue,
                    start: order.venue?.start.toLocaleString("ru-RU"),
                },
            })
        } else {
            throw new Error("order_qr_signature_error")
        }
    } catch (e: any) {
        console.error(e)
        if (e instanceof SyntaxError) return NextResponse.json({ error: "validation_fail" }, { status: 422 })
        else if (e instanceof ZodError) return NextResponse.json({ error: "json_parse_error" }, { status: 422 })
        else return NextResponse.json({ error: e?.message }, { status: 422 })
    }
}
