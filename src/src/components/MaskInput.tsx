import { Input, TextInputProps } from "@mantine/core"
import { useId } from "@mantine/hooks"
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask'

export default function MaskInput (
    {mask, disabled, label, name, maxLength, value, withAsterisk, error, onChange}: 
    Omit<TextInputProps,"value"|"onChange"> & { value: string, onChange: ((value: string) => void) | undefined, mask: string }
    // {label?: string, name?: string, maxLength: number, value: string, , withAsterisk?: boolean, error?: string, onChange?: (value: string) => void  }
) {
    const id = useId()
    const maskGenerator = createDefaultMaskGenerator(mask)
    if (!value || !onChange)
        return <></>
        
    return (
        <Input.Wrapper id={id} label={label} withAsterisk={withAsterisk} error={error}>
            <Input
                disabled={disabled}
                invalid={!!error}
                id={id}
                name={name}
                component={MaskedInput}
                maskGenerator={maskGenerator}
                maxLength={maxLength}
                value={value}
                onChange={onChange}
            />
        </Input.Wrapper>
    )


}