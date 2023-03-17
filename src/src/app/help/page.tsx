import Help from "@/app/help/Help"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Помощь'].join(" | ")
}

export default function HelpPage () {
    return <Help />
}