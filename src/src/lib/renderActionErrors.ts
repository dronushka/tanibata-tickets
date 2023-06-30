import { ServerError } from "@/types/types"
import { ZodError } from "zod"
// { success: boolean; errors: { server: string[]; }; }
export default function renderActionErrors(e: any): {success: boolean, errors: ServerError} {
    console.error(e)

    let errors: ServerError = {
        server: ["unknown_error"],
    }

    if (e instanceof ZodError) {
        const flatten = e.flatten()
        errors = {
            server: flatten.formErrors,
            fields: flatten.fieldErrors,
        }
        // response.errors = [
        //     ...flatten.formErrors,
        //     ...Object.entries(flatten.fieldErrors).map(([key, value]) => (key + ": " + value))
        // ].join(', ')
    } else if (e instanceof Error) {
        errors.server = [e.message]
    }

    return { success: false, errors }
}
