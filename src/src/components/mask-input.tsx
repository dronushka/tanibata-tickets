import { Input } from "@mantine/core"
import { useId } from "@mantine/hooks"
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask'

export default function MaskInput (
    {label, value, mask, withAsterisk, error, onChange}: 
    {label?: string, value: string, mask: string, withAsterisk?: boolean, error?: string, onChange?: (value: string) => void  }
) {
    const id = useId()
    const maskGenerator = createDefaultMaskGenerator(mask)

    return (
        <Input.Wrapper id={id} label={label} withAsterisk={withAsterisk} error={error}>
            <Input
                invalid={!!error}
                id={id}
                component={MaskedInput}
                maskGenerator={maskGenerator}
                value={value}
                onChange={onChange}
            />
        </Input.Wrapper>
    )
}