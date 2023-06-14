import { ZodError } from "zod"

export default function renderErrors (e: any) {
    console.error(e)
    let message: any = ""
    if (e instanceof ZodError) {
        // console.log(e.flatten())
        const flatten = e.flatten()
        message = [
            ...flatten.formErrors,
            ...Object.entries(flatten.fieldErrors).map(([key, value]) => (key + ": " + value))
        ].join(', ')
        
        return { error: message }
    } else if (e instanceof Error) {
        return { error: e.message }
    }
    return { error: "unknown error"}
}