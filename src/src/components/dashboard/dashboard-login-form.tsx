"use client"

import { Button, Flex, Loader, Paper, Stack, TextInput } from "@mantine/core"
import { useState } from "react"

export default function DashboardLoginForm () {
    const [loading, setLoading] = useState<boolean>(false)

    const [email, setEmail] = useState<string>("")
    const [emailError, setEmailError] = useState<string>("")

    const [password, setPassword] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")

    const login = async () => {

    }
    
    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Paper shadow="xs" p="md">
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
                        <TextInput
                            type="password"
                            label="Пароль"
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
                    </Stack>

            </Paper>
        </Flex>
    )
}