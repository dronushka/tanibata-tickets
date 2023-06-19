import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { z } from "zod"
import contentDisposition from "content-disposition"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"
import generateTicket from "@/lib/generateTicket"

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
    const validator = z.number()

    try {
        const session = await getServerSession(authOptions)

        if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

        const validatedId = validator.parse(Number(params.ticketId))

        const order = await prisma.order.findUnique({
            where: {
                id: validatedId
            },
            include: {
                venue: true,
                tickets: {
                    include: {
                        venue: true
                    }
                },
                user: true
            }
        })

        if (session?.user.role !== Role.ADMIN && order?.userId !== session?.user.id) 
            return NextResponse.json({ error: "unauthorized" }, { status: 401 })
        
        if (order !== null) {
            const pdf = Buffer.from(await generateTicket(order))

            return new Response(pdf, {
                status: 200,
                headers: { 
                    "Content-Type": "application/octet-stream",
                    "Content-disposition": contentDisposition("tanibata-tickets-" + order?.id + ".pdf")
                },
              })
            // // console.log(pdf)
            // res.setHeader('Content-Type', 'application/octet-stream')
            // res.setHeader('Content-disposition', contentDisposition("tanibata-tickets-" + order?.id + ".pdf"))
            // res.send(pdf)
        } else
            return NextResponse.json({ error: "order_not_found" }, { status: 422 })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e?.message }, { status: 500 })
    }
}