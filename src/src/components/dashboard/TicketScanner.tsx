"use client"

import { Flex, FocusTrap, Group, Stack, Text, TextInput } from "@mantine/core"
import { useState } from "react"

export default function TicketScanner() {
    const [ code, setCode ] = useState("")
    const [ loading, setLoading ] = useState(false)

    const getOrderByCode = async () => {
        setLoading(true)
        console.log(code)
        setLoading(false)
    }

    return (
        <Flex sx={{
            width: "100%",
            height: "100%",
            // justifyContent: "center",
            // alignItems: "center"
        }}>
            <Stack sx={{ width: "100%"}}>
                <FocusTrap active >
                    <TextInput
                        disabled={loading}
                        label="Код"
                        name="codeInput"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        onKeyUp={e => (e.key === "Enter") && getOrderByCode()}
                    />
                </FocusTrap>
            </Stack>
        </Flex>
    )
}