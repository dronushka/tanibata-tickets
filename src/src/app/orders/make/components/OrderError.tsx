import getErrorText from "@/lib/getErrorText"
import { Text } from "@mantine/core"
export default function OrderError ({text}: {text: string}) {
    return <Text align="center">{getErrorText(text)}</Text>
}