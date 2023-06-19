import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { z } from "zod"
import path from "path"
import fs from "fs"
import contentDisposition from "content-disposition"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
    const validator = z.number()

    try {
        const session = await getServerSession(authOptions)

        if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

        const validatedId = validator.parse(Number(params.fileId))

        const file = await prisma.file.findUnique({
            where: {
                id: validatedId,
            },
            include: {
                order: true,
            },
        })

        if (session?.user.role !== Role.ADMIN && file?.order?.userId !== session?.user.id)
            return NextResponse.json({ error: "unauthorized" }, { status: 401 })

        if (!file) return NextResponse.json({ error: "file_not_found" }, { status: 401 })

        const filePath = path.join(process.env.LOCAL_FILE_STORAGE ?? "/var/www/file_storage", file.path)

        if (!fs.existsSync(filePath)) return NextResponse.json({ error: "file_not_found" }, { status: 401 })

        const buffer = fs.readFileSync(filePath)

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-disposition": contentDisposition(file.path),
            },
        })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e?.message }, { status: 500 })
    }
}
