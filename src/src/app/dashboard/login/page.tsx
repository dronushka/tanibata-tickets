import DashboardLoginForm from "@/components/dashboard/DashboardLoginForm"
import LoginForm from "@/components/LoginForm"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Админка', 'Авторизация'].join(" | ")
}

export default function DashboardLoginPage () {
    return <LoginForm />
    // return <DashboardLoginForm />
}