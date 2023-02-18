"use client"

import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, TextInput } from "@mantine/core"
import { useState } from "react"
import { z } from "zod"

export default function LoginForm() {
    const [ email, setEmail ] = useState<string>("")
    const [ emailError, setEmailError ] = useState<string>("")
    const [ password, setPassword ] = useState<string>("")
    const [ emailIsSent, setEmailIsSet ] = useState<boolean>(false)
    const [ loading, setLoading ] = useState<boolean>(false)

    const [ aquiredPassword, setAquiredPassword ] = useState<string>("")
    
    const emailValidator = z.string().email()

    const sendEmail = async () => {
        const validated = emailValidator.safeParse(email)
        if (validated.success) {

            setLoading(true)

            const res = await fetch("/api/sendPassword", {
                method: "POST",
                headers: new Headers({'content-type': 'application/json'}),
                credentials: 'include',
                body: JSON.stringify({ email })
            })

            setLoading(false)

            if (res.ok) {
                setAquiredPassword((await res.json()).password)
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
                            rightSection={loading && <Loader size="xs" />}
                        />
                        <Button
                            onClick={sendEmail}
                        >
                            Отправить одноразовый пароль
                        </Button>
                    </Stack>
                )}
                {emailIsSent && (
                    <Stack sx={{ width: 400, height: 115 }}>
                        {aquiredPassword && <Text>{aquiredPassword}</Text>}
                        <TextInput 
                            type="password"
                            label="Одноразовый пароль"
                            withAsterisk
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            onClick={sendEmail}
                        >
                            Отправить одноразовый пароль
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Flex>
    )
}