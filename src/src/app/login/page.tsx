import LoginForm from "@/components/LoginForm"

export const metadata = {
    title: [process.env.FEST_TITLE, 'Авторизация'].join(" | "),
}

export default async function LoginPage ({ searchParams }: { searchParams?: { [key: string]: string | undefined }}) {
    return <LoginForm callbackUrl="/"/>
}