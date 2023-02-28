import { prisma } from "@/db"
import MakeOrder from "@/components/order-make/make-order"
import { getServerSession } from "next-auth/next"
import { User } from "@prisma/client"

export default async function Page() {
    const session = await getServerSession()

    let user: User | null = null

    if (session?.user?.email)
        user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        })

    const venue = await prisma.venue.findFirst({
        where: {
            id: 1
        },
        include: {
            rows: {
                include: {
                    tickets: {
                        include: {
                            priceRange: true,
                            order: true
                        }
                    }
                }
            }
        }
    })


    // console.log(venue)

    return <MakeOrder user={user ?? undefined} venue={venue} />
}