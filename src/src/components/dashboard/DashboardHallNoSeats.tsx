"use client"

import { Stack, Text } from "@mantine/core"

export default function DashboardHallNoSeats({ name, start, reserved, total }:
    { name: string, start: string, reserved: number, total: number }) {
    return <Stack>
        <Text fw="bold">{name} {start}</Text>
        <Text>Заполненность зала: {reserved}/{total} ({((reserved / total) * 100).toFixed(2)}%)</Text>
    </Stack>
}