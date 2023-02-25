"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, TextInput } from "@mantine/core"

export const sendPasswordEmail = async (email: string) => {
    const emailValidator = z.string().email()
    const validated = emailValidator.safeParse(email)
    if (!validated.success)
        return {
            success: false,
            error: "Неправильный формат e-mail"
        }
    else {

        // setLoading(true)

        const res = await fetch("/api/sendPassword", {
            method: "POST",
            headers: new Headers({ 'content-type': 'application/json' }),
            // credentials: 'include',
            body: JSON.stringify({ email })
        })

        // setLoading(false)

        if (res.ok) {
            return ({success: true})
        } else {
            const response = await res.json()
            if (response?.error === "user_not_found")
                return {
                    success: false,
                    error: "Указанная почта не найдена в системе"
                }
            else
                return {
                    success: false,
                    error: "Что-то пошло не так, попробуйте позже"
                }
        }
    } 
}

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