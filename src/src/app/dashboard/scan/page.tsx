import TicketScanner from "@/components/dashboard/TicketScanner"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка', 'Сканер билетов'].join(" | ")
}

export default function ScanPage () {
    return <TicketScanner />
}