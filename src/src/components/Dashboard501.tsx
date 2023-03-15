"use client"

import { Button, Group, Stack, Text } from "@mantine/core"
import { signOut } from "next-auth/react"
import Link from "next/link"
import FullAreaMessage from "./FullAreaMessage"

export default function Dashboard501() {
    return <FullAreaMessage>
        <Stack align="center">
            <Text fz="lg">501</Text>
            <Text fz="lg">Недостаточно прав для просмотра этого раздела</Text>
            <Group>
                <Button variant="default" onClick={() => signOut()}>Выйти из аккаунта</Button>
                <Link href="/" passHref legacyBehavior>
                    <Button component="a">Вернуться на главную</Button>
                </Link>
            </Group>
        </Stack>
    </FullAreaMessage>
}