"use client"

import { FileButton } from "@mantine/core"
import { useTransition } from "react"
import { uploadCheque } from "../actions/uploadCheque"

export default function UploadChequeButton({orderId}: {orderId: number}) {
    const [ isPending, startTransition ] = useTransition()
    
    return (
        <FileButton
            onChange={(value) => {
                if (!value) return
                const form = new FormData()
                form.append("orderId", String(orderId))
                form.append("cheque", value)

                startTransition(() => uploadCheque(form))
            }}
            // onChange={(value) => setCheque({orderId: order.id, file: value})}
            //   onChange={(value) => sendCheque(order.id, value)}
            accept="image/png,image/jpeg,application/pdf"
        >
            {(props) => (
                <Button
                    {...props}
                    // loading={order.id === loading}
                    disabled={!!isPending && loadingOrderId !== order.id}
                    color={orderError?.orderId === order.id ? "red" : "primary"}
                    variant="outline"
                    leftIcon={<IconUpload />}
                >
                    {order.cheque ? "Приложить другой" : "Приложить чек"}
                </Button>
            )}
        </FileButton>
    )
}
