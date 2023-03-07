"use client"

import { Flex, Loader } from "@mantine/core"

export default function FullAreaLoading() {
    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Loader size="xl" />
        </Flex>
    )
}