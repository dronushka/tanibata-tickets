"use client"

import { Button, Stack, Text, ThemeIcon } from "@mantine/core"
import { IconAlertTriangle } from "@tabler/icons-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import FullAreaMessage from "./FullAreaMessage"

export default function AuthError() {
    const searchParams = useSearchParams()
    // console.log(searchParams)
    return <FullAreaMessage>
        <Stack align="center">
            <ThemeIcon variant="outline" color="red" size="xl" sx={{ border: 0 }}>
                <IconAlertTriangle size={40} />
            </ThemeIcon>
            <Text fz="lg">Ошибка авторизации</Text>
            {searchParams?.get('error') === "Verification" && <>
                <Text>Ссылка недействительна!</Text>
                <Text>Вероятно с ее помощью уже был осуществлен вход</Text>
            </>}
            {searchParams?.get('error') !== "Verification" && <Text>{searchParams?.get('error')}</Text>}
            <Link href="/login" passHref legacyBehavior>
                <Button component="a">Запросить новую ссылку</Button>
            </Link>
        </Stack>
    </FullAreaMessage>
}