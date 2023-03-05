import DashboardHall from "@/components/dashboard/dashboard-hall"
import DashboardLoader from "@/components/dashboard/dashboard-loader"
import { prisma } from "@/db"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'admin')
        redirect('/dashboard/login')

    const venue = await prisma.venue.findUnique({
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
                        },
                        orderBy: [
                            { row: { number: "asc" } },
                            { sortNumber: "desc" }
                        ]
                    }
                }
            }
        }
    })

    const total = await prisma.ticket.count({
        where: {
            row: {
                venueId: 1
            }
        }
    })

    const reserved = await prisma.ticket.count({
        where: {
            AND: [
                {
                    row: {
                        venueId: 1
                    }
                },
                {
                    OR: [
                        {
                            orderId: {
                                gt: 0
                            }
                        },
                        {
                            reserved: true
                        }
                    ]
                }

            ]

        }
    })

    if (!venue)
        return <DashboardLoader />

    return <DashboardHall
        venue={{
            ...venue,
            rows: venue?.rows.map(row => ({
                ...row,
                tickets: row.tickets.map(ticket => ({
                    ...ticket,
                    order: ticket.order && {
                        ...ticket.order,
                        createdAt: ticket.order?.createdAt.toLocaleString("ru-RU")
                    }
                }))
            })) || []
        }}
        reserved={reserved}
        total={total}
    />
}