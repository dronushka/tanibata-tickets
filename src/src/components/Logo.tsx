import Link from "next/link"
import { Box, Text } from "@mantine/core"
import Image from "next/image"

export default function Logo() {
    return (
        <Link href="/" passHref legacyBehavior>
            <Box sx={{position: "relative", width: 100, height: 50}}>
                <Image src="/logo.png" alt="Нян-Фест 2023 | Главная" fill />
            </Box>
        </Link>
    )
}