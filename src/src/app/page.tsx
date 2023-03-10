import { prisma } from "@/db"
import ClientMain from "./ClientMain"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Главная'].join(" | "),
}

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