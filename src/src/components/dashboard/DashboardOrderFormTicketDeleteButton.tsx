"use client"

import { ServerAction } from "@/types/types"
import { ActionIcon, Button, Group, Input, Modal, Text } from "@mantine/core"

import { IconX } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export default function DashboardOrderFormTicketDeleteButton({ ticketId, removeTicket }: { ticketId: number, removeTicket: ServerAction }) {
    const [ isPending, startTransition ] = useTransition()
    const router = useRouter()

    const [ showConfirmation, setShowConfirmation ] = useState(false)
    const [ error, setError ] = useState("")

    return (
        <>
            <ActionIcon variant="subtle" color="red" onClick={() => setShowConfirmation(true)}>
                <IconX size="1rem" />
            </ActionIcon>
            {showConfirmation && <Modal opened onClose={() => setShowConfirmation(false)} title="Подтвердите действие" centered>
                <Text mb="md">Вы точно уверены, что хотите убрать место из заказа?</Text>
                {error && <Input.Error>{error}</Input.Error>}
                <Group sx={{ justifyContent: "flex-end" }}>
                    <Button disabled={isPending} variant="default" onClick={() => setShowConfirmation(false)}>
                        Нет
                    </Button>
                    <Button
                        loading={isPending}
                        onClick={() => {
                            // const form = new FormData()
                            // form.append("orderId", String(order.id))
                            setError("")
                            startTransition(() => {
                                removeTicket(ticketId).then((res) => {
                                    if (res?.success === false) setError(res.errors?.server?.join(", ") ?? "")

                                    setShowConfirmation(false)
                                    router.refresh()
                                })
                            })
                        }}
                    >
                        Да
                    </Button>
                </Group>
            </Modal>}
        </>
    )
}
