"use client"

import { Box, Button, Center, Flex, Paper, Stack, TextInput } from "@mantine/core"
import { useState } from "react"
import { z } from "zod"

export default function LoginForm() {
    const [ email, setEmail ] = useState<string>("")
    const [ emailError, setEmailError ] = useState<string>("")
    const [ password, setPassword ] = useState<string>("")
    const [ emailIsSent, setEmailIsSet ] = useState<boolean>(false)

    const emailValidator = z.string().email()

    const sendEmail = () => {
        const validated = emailValidator.safeParse(email)
        if (validated.success) {
            //send api request here
            setEmailIsSet(true)
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
                    <Stack sx={{ width: 400, height: 133 }}>
                        <TextInput 
                            label="E-mail"
                            withAsterisk
                            error={emailError}
                            onChange={(e) => {
                                setEmailError(false)
                                setEmail(e.target.value)
                            }}
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