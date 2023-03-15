import Rules from "./Rules"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Правила посещения'].join(" | "),
}

export default function RulesPage () {
    return <Rules />
}