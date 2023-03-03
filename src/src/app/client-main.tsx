"use client"
import FullPageMessage from "@/components/full-page-message"
import { Box, Button, Stack, Text } from "@mantine/core"
import Link from "next/link"

export default function ClientMain() {
    return <FullPageMessage>
        <Stack>
            <Text>Бла, бла, бла важная информация</Text>
            <Link href="/orders/make" passHref legacyBehavior>
                <Button component="a">Купить билеты</Button>
            </Link>
        </Stack>
    </FullPageMessage>
}