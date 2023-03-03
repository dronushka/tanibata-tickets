import { Text } from "@mantine/core"
export default function OrderError ({text}: {text?: string}) {
    let errorText = "Что пошло не так, попробуйте позже ..."
    if (text === "some_tickets_are_bought")
        errorText = "К сожалению выбранные места уже заняты, попробуйте выбрать другие."
    return <Text align="center">{errorText}</Text>
}