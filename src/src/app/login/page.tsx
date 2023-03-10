import LoginForm from "@/components/LoginForm"
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"

export default async function LoginPage ({ searchParams }: { searchParams?: { [key: string]: string | undefined }}) {
    // const session = await getServerSession()
    // // console.log(session)
    // // const router = useRouter()
    // if (session)
    //     redirect("/orders")
    return <LoginForm />
}