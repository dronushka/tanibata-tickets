import { useState } from "react"
import { z } from "zod"
import { Box, Button, FileButton, Flex, Group, Input, List, Paper, Stack, Text } from "@mantine/core"
import { IconUpload } from "@tabler/icons-react"
import { ClientOrder } from "./useOrder"

export default function PaymentForm({ order, onSubmit }: { order: ClientOrder, onSubmit: (order: ClientOrder) => void}) {
    const [cheque, setCheque] = useState<File | undefined>(order?.cheque)

    const [chequeError, setChequeError] = useState<string>("")
    
    const chequeValidator = z.custom<File>().superRefine((file, ctx) => {
        if (!(file instanceof File)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Приложите файл",
            fatal: true,
          })
      
          return z.NEVER
        }
      
        if (file.size > 2 * 1024 * 1024) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Размер файл не должен превышать 2МБ",
            fatal: true
          })

          return z.NEVER
        }

        if (!(["image/png", "image/jpeg", "application/pdf"].find(f => f === file.type))) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Допустимые форматы файла: jpeg, png, pdf",
              fatal: true
            })
  
            return z.NEVER
          }
        
      })

    const changeCheque = (value: File) => {
        const res = chequeValidator.safeParse(value)

        if (res.success) {
            setChequeError("")
            setCheque(value)
        }
        else
            setChequeError(res.error.flatten().formErrors.join(', '))
    }

    const send = () => {
        const res = chequeValidator.safeParse(cheque)
        if (res.success)
            onSubmit({ ...order, cheque })
        else 
            setChequeError(res.error.flatten().formErrors.join(', '))
    }

    const sum = [...order.tickets.values()].reduce((s, ticket) => (s += (ticket.priceRange?.price ?? 0)), 0)

    return (
        <Paper shadow="sm" radius="md" p="md">
            <Stack>
                <Text fz="xl">Билеты забронированы!</Text>
                <List type="ordered">
                    {[...order.tickets.values()].map(ticket => (
                        <List.Item key={ticket.id} >
                            <Group>
                                <Text>Ряд: {ticket.rowNumber} Место: {ticket.number}</Text>
                                <Text>{ticket.priceRange?.price.toFixed(2)} р.</Text>
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
                        {cheque && <Text>{cheque.name}</Text>}
                        <Text color="gray" size="sm">Файл размером не более 2 Мб,</Text>
                        <Text color="gray" size="sm">Файл формате: jpeg, png, pdf</Text>
                    </Box>
                    <Box>
                        <FileButton
                            onChange={changeCheque}
                            accept="image/png,image/jpeg,application/pdf"
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