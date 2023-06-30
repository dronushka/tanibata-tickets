import { Input, TextInputProps } from "@mantine/core"
import { useId } from "@mantine/hooks"
import { IMaskInput } from "react-imask"

export default function MaskInput({
    mask,
    disabled,
    label,
    name,
    maxLength,
    value,
    withAsterisk,
    error,
    onChange,
}: Omit<TextInputProps, "value" | "onChange"> & {
    value: string
    onChange: ((value: string) => void) | undefined
    mask: string
}) {
    const id = useId()

    return (
        <Input.Wrapper
            id={id}
            label={label}
            required
            withAsterisk={withAsterisk}
            error={error}
        >
            <Input<any>
                component={IMaskInput}
                disabled={disabled}
                invalid={!!error}
                mask={mask}
                id={id}
                maxLength={maxLength}
                value={value}
                onAccept={(value: string) => { onChange && onChange(value) }}
            />
        </Input.Wrapper>
    )
}
