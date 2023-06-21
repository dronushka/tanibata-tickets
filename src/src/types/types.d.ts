export type ServerError = {
    server?: string[],
    fields?: {
        [name: string]: string[] | undefined
    } 
}
export type ServerAction = (data: any) => Promise<{
    success: boolean,
    data?: any,
    errors?: ServerError
}>

interface PaymentDataForm extends FormData {
    append(name: "orderId" | "goodness" | "comment" | "goodness", value: string): void
    append(name: "cheque", value: File, fileName?: string): void
}