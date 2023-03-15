import Privacy from "./Privacy"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Политика в отношении обработки персональных данных'].join(" | "),
}

export default function RulesPage () {
    return <Privacy />
}