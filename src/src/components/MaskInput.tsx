import { Input } from "@mantine/core"
import { useId } from "@mantine/hooks"
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask'

export default function MaskInput (
    {label, name, maxLength, value, mask, withAsterisk, error, onChange}: 
    {label?: string, name?: string, maxLength: number, value: string, mask: string, withAsterisk?: boolean, error?: string, onChange?: (value: string) => void  }
) {
    const id = useId()
    const maskGenerator = createDefaultMaskGenerator(mask)
    // console.log('phone error', error)
    return (
        <Input.Wrapper id={id} label={label} withAsterisk={withAsterisk} error={error}>
            <Input
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