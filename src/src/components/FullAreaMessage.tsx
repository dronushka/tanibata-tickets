"use client"

import { Flex, Paper } from "@mantine/core"
import { ReactNode } from "react"

export default function FullAreaMessage({children}: {children: ReactNode}) {
    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Paper shadow="xs" p="md">
                {children}
            </Paper>
        </Flex>
    )
}