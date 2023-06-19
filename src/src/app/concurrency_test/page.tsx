import ClientConcurrencyTest from "./ClientConcurrencyTest"

export default async function ConcurrencyTestPage () {
    // const session = await getServerSession(authOptions)

    // if (session?.user.role !== Role.ADMIN)
    //     redirect('/dashboard/login')

    return <ClientConcurrencyTest />
}