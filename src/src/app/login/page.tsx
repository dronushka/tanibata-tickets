import LoginForm from "./client/login-form"

export default function LoginPage ({ searchParams }: { searchParams?: { [key: string]: string | undefined }}) {
    return <LoginForm 
        callbackUrl={searchParams?.callbackUrl}
    />
}