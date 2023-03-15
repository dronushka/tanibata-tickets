"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button, Flex, Loader, Paper, Stack, Text, TextInput } from "@mantine/core"
import { sendPasswordEmail } from "@/lib/api-calls"
import { useRouter } from "next/navigation"
import FullAreaLoading from "./FullAreaLoading"

export default function LoginForm(
    { clientEmail, callbackUrl }:
        { clientEmail?: string, callbackUrl?: string }
) {
    const [email, setEmail] = useState<string>(String(clientEmail))
    const [emailError, setEmailError] = useState<string>("")
    const [emailIsSent, setEmailIsSet] = useState<boolean>(!!clientEmail)

    const [loading, setLoading] = useState<boolean>(false)

    const [counter, setCounter] = useState(0)

    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
    }, [counter])

    useEffect(() => {
        if (counter <= 0) {
            setCounter(10)
        }
    }, [clientEmail])

    const sendEmail = async () => {
        setLoading(true)
        try {
            const result = await signIn("email", { email, redirect: false })
            setEmailIsSet(true)
            console.log(result)
        } catch (e: any) {
            console.error(e)
            setEmailError(e?.message)
        }
        setLoading(false)
    }

    const router = useRouter()

    const { status } = useSession()

    if (status === "authenticated")
        callbackUrl && router.push(callbackUrl)

    if (status === "loading" || status === "authenticated")
        return <FullAreaLoading />

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Paper shadow="xs" p="md" sx={{ maxWidth: 400 }}>
                {!emailIsSent && (
                    <Stack>
                        <TextInput
                            label="E-mail"
                            name="email"
                            withAsterisk
                            error={emailError}
                            maxLength={100}
                            onChange={(e) => {
                                setEmailError("")
                                setEmail(e.target.value)
                            }}
                            disabled={loading}
                            rightSection={loading && <Loader size="xs" />}
                        />
                        <Button
                            loading={loading}
                            onClick={sendEmail}
                        >
                            Получить ссылку для входа
                        </Button>
                    </Stack>
                )}
                {emailIsSent && (
                    <Stack>
                        <Text fz="sm">Если email не пришёл проверьте раздел &quot;спам&quot;</Text>
                        <Button
                            variant="subtle"
                            disabled={counter > 0}
                            onClick={() => {
                                setEmailIsSet(false)
                                setEmail("")
                                setEmailError("")
                            }}
                        >
                            Отправить ссылку на другой e-mail {counter > 0 && `(${counter})`}
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Flex>
    )
}