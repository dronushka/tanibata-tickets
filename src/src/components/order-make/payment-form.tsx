import { Box, Button, Checkbox, FileButton, Flex, Group, Input, List, Paper, Stack, Text } from "@mantine/core"
import { IconUpload } from "@tabler/icons-react"
import { useState } from "react"
import { z } from "zod"
import { useOrder } from "./use-order"

export default function PaymentForm() {
    const { order, setOrder, nextStage } = useOrder()
    const [chequeError, setChequeError] = useState<string>("")

    const chequeValidator = z.custom<File>(val => val instanceof File, "Приложите файл")

    const setCheque = (value: File) => {
        const res = chequeValidator.safeParse(value)

        if (res.success) {
            setChequeError("")
            setOrder && setOrder(prev => ({ ...prev, cheque: value }))
        }
        // else
        //     setChequeError(res.error)
    }

    const send = () => {
        const res = chequeValidator.safeParse(order?.cheque)
        // console.log('send', !order?.cheque, !res.success)
        if (!order?.cheque || !res.success)
            setChequeError("Приложите файл")
        else
            nextStage()
    }

    if (!order)
        return <></>

    const sum = [...order.tickets.values()].reduce((s, ticket) => (s += ticket.priceRange.price), 0)

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Text fz="xl">Билеты забронированы!</Text>
                <List type="ordered">
                    {[...order.tickets.values()].map(ticket => (
                        <List.Item key={ticket.id} >
                            <Group>
                                <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                <Text>{ticket.priceRange.price.toFixed(2)} р.</Text>
                            </Group>
                        </List.Item>
                    ))}
                </List>

                <Text>Для завершения, оплатите заказ на сумму {sum.toFixed(2)} р. и приложите чек ниже.</Text>
                <Text>Реквизиты для перевода оплаты за билеты</Text>

                <Text weight={700}>1234 5678 9012 3456, Сбербанк.</Text>
                <Text>Перевод на имя: Дмитрий З..</Text>

                <Text>
                    В поле назначение платежа (сообщение) указывать ничего не требуется,
                    данные о билете мы берём из данной формы.
                </Text>
                {/* <Checkbox 
                    label="Активировать Добро!"
                    checked={checked} 
                    onChange={(event) => setChecked(event.currentTarget.checked)} 
                /> */}
                <Group>
                    <Box>
                        {order.cheque && <Text>{order.cheque.name}</Text>}
                        <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                        <Text color="gray" size="sm">Файл формате: jpeg, png</Text>
                    </Box>
                    <Box>
                        <FileButton
                            onChange={setCheque}
                            accept="image/png,image/jpeg"
                        >
                            {(props) => (
                                <Button
                                    {...props}
                                    color={chequeError ? "red" : "primary"}
                                    variant="outline"
                                    leftIcon={<IconUpload />}
                                >
                                    Приложить чек
                                </Button>
                            )}
                        </FileButton>
                        <Input.Error>{chequeError}</Input.Error>
                    </Box>
                </Group>
                <Flex >
                    <Button onClick={send}>Отправить</Button>
                </Flex>
            </Stack>
        </Paper>
    )
}