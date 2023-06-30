import { ZodError } from "zod"

export default function renderActionResponse (data?: any) {
    return {
        success: true,
        data
    }
}