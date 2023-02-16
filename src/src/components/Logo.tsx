import Link from "next/link"
import { Text } from "@mantine/core"

export default function Logo() {
    return (
        <Link href="/" passHref legacyBehavior>
            <Text>Танибата</Text>
        </Link>
    )
}