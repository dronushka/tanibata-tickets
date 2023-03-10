import DashboardLoginForm from "@/components/dashboard/DashboardLoginForm"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка', 'Авторизация'].join(" | ")
}

export default function DashboardLoginPage () {
    return <DashboardLoginForm />
}