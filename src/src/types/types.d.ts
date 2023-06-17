export type ServerError = {
    server?: string[],
    fields?: {
        [name: string]: string[] | undefined
    } 
}
export type ServerMutation = (data: any) => Promise<{
    success: boolean,
    data?: any,
    errors?: ServerError
}>
