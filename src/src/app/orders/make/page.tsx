import { prisma } from "@/db"
import MakeOrder from "@/components/order-make/make-order"
import { getServerSession } from "next-auth/next"
import { User } from "@prisma/client"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
// import { ClientVenue } from "@/types/types"

export default async function Page() {
    const session = await getServerSession(authOptions)

    let user: User | null = null

    if (session?.user?.id)
        user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        })

    const venue = await prisma.venue.findUnique({
        where: {
            id: 1
        },
        include: {
            rows: {
                include: {
                    tickets: {
                        include: {
                            priceRange: true
                        }
                    }
                }
            }
        }
    })

    return <MakeOrder
        user={user && {
            ...user,
            createdAt: user.createdAt.toLocaleString("ru-RU")
        }}
        venue={venue && {
            ...venue,
            rows: venue.rows.map(
                row => (
                    {
                        ...row,
                        tickets: row.tickets.map(
                            ticket => (
                                {
                                    ...ticket,
                                    rowNumber: String(row.number)
                                }
                            )
                        )
                    }
                )
            )
        }}
    />
}