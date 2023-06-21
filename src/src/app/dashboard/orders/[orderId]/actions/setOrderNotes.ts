"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import renderActionErrors from "@/lib/renderActionErrors"
import renderActionResponse from "@/lib/renderActionResponse"
import { z } from "zod"
import { ServerAction } from "@/types/types"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

const setOrderNotes: ServerAction = async (data: { id: number; notes: string }) => {
    try {
        const session = await getServerSession(authOptions)

        if (session?.user.role !== Role.ADMIN) throw new Error("unauthorized")

        const validator = z.object({
            id: z.number(),
            notes: z.string().max(1000),
        })

        const { id, notes } = validator.parse(data)

        await prisma.order.update({ where: { id }, data: { notes } })
        
        return renderActionResponse()
    } catch (e: any) {
        return renderActionErrors(e)
    }
}

export default setOrderNotes
