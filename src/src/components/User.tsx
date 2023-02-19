
import { ActionIcon, Group, Stack, Text } from "@mantine/core"
import { IconLogout } from "@tabler/icons-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function User() {
    const { data: user } = useSession()
    const router = useRouter()

    const logout = async () => {
        await signOut()
        router.push("/")
    }

    if (!user)
        return <></>
        
    return (
        <Stack>
            <Text>Вы вошли как:</Text>
            <Group>
                <Text>{user?.user?.email}</Text>
                <ActionIcon>
                    <IconLogout 
                        onClick={logout}
                    />
                </ActionIcon>
            </Group>
        </Stack>
    )
}