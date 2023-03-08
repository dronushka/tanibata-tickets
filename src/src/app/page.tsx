import { prisma } from "@/db"
import ClientMain from "./ClientMain"

export default async function Page() {
    const venues = await prisma.venue.findMany({
        where: {
            active: true,
            start: {
                gt: new Date()
            }
        }
    })

    return <ClientMain venues={venues.map(venue => ({
        ...venue,
        start: venue.start.toLocaleString('ru-RU')
    }))}/>
}