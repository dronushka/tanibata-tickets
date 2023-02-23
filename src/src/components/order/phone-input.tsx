"use client"
import { Input, TextInput } from "@mantine/core"
import { useId } from "@mantine/hooks"
import { ChangeEventHandler, FormEventHandler, forwardRef } from "react"
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask'
import { useWebMask } from 'react-hook-mask'

export default function PhoneInput(
    {label, value, withAsterisk, error, setValue}: 
    {label?: string, value: string, withAsterisk?: boolean, error?: string, setValue?: (value: string) => void  }
) {
    const id = useId()
    const maskGenerator = createDefaultMaskGenerator('+7 (999) 999-99-99')
    return (
        <Input.Wrapper id={id} label={label} withAsterisk={withAsterisk} error={error}>
            <Input
                // sx={error ? {borderColor: "red"} : {}}
                // sx={{background: "red"}}
                invalid={!!error}
                id={id}
                component={MaskedInput}
                maskGenerator={maskGenerator}
                value={value}
                onChange={setValue}
            />
        </Input.Wrapper>
    )
}