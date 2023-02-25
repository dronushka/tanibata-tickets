"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, TextInput } from "@mantine/core"

export default function LoginForm({ clientEmail, callback }: { clientEmail?: string, callback?: () => void }) {
    const [email, setEmail] = useState<string>(String(clientEmail))
    const [emailError, setEmailError] = useState<string>("")
    const [emailIsSent, setEmailIsSet] = useState<boolean>(false)

    const [password, setPassword] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")

    const [loading, setLoading] = useState<boolean>(false)

    const emailValidator = z.string().email()

    const sendEmail = async () => {
        const validated = emailValidator.safeParse(email)
        if (validated.success) {

            setLoading(true)

            const res = await fetch("/api/sendPassword", {
                method: "POST",
                headers: new Headers({ 'content-type': 'application/json' }),
                // credentials: 'include',
                body: JSON.stringify({ email })
            })

            setLoading(false)

            if (res.ok) {
                setEmailIsSet(true)
            } else {
                const response = await res.json()
                if (response?.error === "user_not_found")
                    setEmailError("Указанная почта не найдена в системе")
                else
                    setEmailError("Что-то пошло не так, попробуйте позже")
            }
        } else {
            setEmailError("Неправильный формат e-mail")
        }
    }

    const [counter, setCounter] = useState(0)

    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
    }, [counter])

    useEffect(() => {
        if (!emailIsSent && counter <= 0) {
            console.log('clientEmail', clientEmail)
            sendEmail()
            setCounter(10)
        }
    }, [clientEmail])

    async function login() {
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
                // callback && callback()
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
                                callback && callback()
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