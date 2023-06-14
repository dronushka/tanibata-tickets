export type ServerMutation = (data: FormData) => Promise<{error: string} | undefined>
export type ServerMutations = { [name: string]: ServerMutation }
