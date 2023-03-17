"use client"
import { Flex, MantineTheme, Text } from "@mantine/core"

export default function Stage() {
    return (
        <Flex sx={{
            justifyContent: "center",
            marginBottom: 20
        }}>
            <Flex sx={
                (theme: MantineTheme) => ({
                    backgroundColor: theme.colors.gray[4],
                    borderRadius: 4,
                    justifyContent: "center",
                    flexGrow: 1,
                    flexShrink: 1,
                    maxWidth: 600
                })
            }>
                <Text>Сцена</Text>
            </Flex>
        </Flex>
    )
}