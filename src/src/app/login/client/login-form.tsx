"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { z } from "zod"
import { Box, Button, Center, Flex, Loader, Paper, Stack, Text, TextInput } from "@mantine/core"
import { useRouter } from "next/navigation"

export default function LoginForm({callbackUrl}: {callbackUrl: string | undefined} ) {
    const [ email, setEmail ] = useState<string>("")
    const [ emailError, setEmailError ] = useState<string>("")
    const [ emailIsSent, setEmailIsSet ] = useState<boolean>(false)
    
    const [ password, setPassword ] = useState<string>("")
    const [ passwordError, setPasswordError ] = useState<string>("")
    
    const [ loading, setLoading ] = useState<boolean>(false)

    // const [ aquiredPassword, setAquiredPassword ] = useState<string>("")
    
    const emailValidator = z.string().email()

    const sendEmail = async () => {
        const validated = emailValidator.safeParse(email)
        if (validated.success) {

            setLoading(true)

            const res = await fetch("/api/sendPassword", {
                method: "POST",
                headers: new Headers({'content-type': 'application/json'}),
                // credentials: 'include',
                body: JSON.stringify({ email })
            })

            setLoading(false)

            if (res.ok) {
                // setAquiredPassword((await res.json()).password)
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

    const router = useRouter()

    const passwordValidator = z.string()

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
                console.log("logged in")
                
                router.replace(callbackUrl ?? '/orders')
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
                    <Stack sx={{ width: 400}}>
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
                            onClick={() => {
                                setEmailIsSet(false)
                                setEmail("")
                                setEmailError("")
                                setPassword("")
                                setPasswordError("")
                            }}
                        >
                            Отправить пароль на другой e-mail
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Flex>
    )
}