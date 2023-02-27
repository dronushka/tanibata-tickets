"use client"

import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import {  Button, Flex, Loader, Paper, Stack, TextInput } from "@mantine/core"
import { sendPasswordEmail } from "@/lib/api-calls"

export default function LoginForm(
    { clientEmail, callback, rollback }: 
    { clientEmail?: string, callback?: () => void, rollback?: () => void }
) {
    const [email, setEmail] = useState<string>(String(clientEmail))
    const [emailError, setEmailError] = useState<string>("")
    const [emailIsSent, setEmailIsSet] = useState<boolean>(!!clientEmail)

    const [password, setPassword] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")

    const [loading, setLoading] = useState<boolean>(false)

    const [counter, setCounter] = useState(0)

    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
    }, [counter])

    useEffect(() => {
        if (counter <= 0) {
            setCounter(10)
        }
    }, [ clientEmail ])

    const sendEmail = async () => {
        setLoading(true)
        const result = await sendPasswordEmail(email)
        if (result.success)
            setEmailIsSet(true)
        else if (result.error) {
            setEmailError(result.error)
        }
        setLoading(false)
    }

    const login = async () => {
        setLoading(true)
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password
            })
            console.log('res', res)

            if (res?.ok) {
                console.log("logged in as ", email)
                callback && callback()
                // router.replace(callbackUrl ?? '/orders')
            }
            else
                setPasswordError("Ошибка аутентификации. Проверьте email или пароль.")

        } catch (e) {
            console.error(e)
            setPasswordError("Что-то пошло не так")
        }
        setLoading(false)
    }

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Paper shadow="xs" p="md">
                {!emailIsSent && (
                    <Stack sx={{ width: 400 }}>
                        <TextInput
                            label="E-mail"
                            name="email"
                            withAsterisk
                            error={emailError}
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
                            Отправить одноразовый пароль
                        </Button>
                    </Stack>
                )}
                {emailIsSent && (
                    <Stack sx={{ width: 400 }}>
                        {/* {aquiredPassword && <Text>{aquiredPassword}</Text>} */}
                        <TextInput
                            type="password"
                            label="Одноразовый пароль"
                            withAsterisk
                            error={passwordError}
                            onChange={(e) => setPassword(e.target.value)}
                            rightSection={loading && <Loader size="xs" />}
                            disabled={loading}
                        />
                        <Button
                            loading={loading}
                            onClick={login}
                        >
                            Войти
                        </Button>
                        <Button
                            variant="subtle"
                            disabled={counter > 0}
                            onClick={() => {
                                setEmailIsSet(false)
                                setEmail("")
                                setEmailError("")
                                setPassword("")
                                setPasswordError("")
                                rollback && rollback()
                            }}
                        >
                            Отправить пароль на другой e-mail {counter > 0 && `(${counter})`}
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Flex>
    )
}