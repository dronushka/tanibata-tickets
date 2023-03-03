import { OrderStatus } from "@/types/types"
import { Group, MantineColor, MantineTheme, Select, Text } from "@mantine/core"
import { forwardRef, ReactNode } from "react"

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    color: MantineColor,
    label: string
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ color, label, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Text color={color} size="sm" fw="bold">{label}</Text>
        </div>
    )
)

SelectItem.displayName = "SelectItem"

export default function OrderStatusSelect({value, onChange} : {value: string, onChange: (value: OrderStatus) => void}) {
    const getColor = (status: OrderStatus) => {
        if (status === "pending") return "yellow"
        if (status === "returnRequested") return "pink"
        if (status === "returned") return "blue"
        if (status === "complete") return "green"
        return "black"
    }
    return <Select
        styles={(theme: MantineTheme) => ({
            input: {
                color: theme.colors[getColor(value as OrderStatus)],
                fontWeight: 500,
                '&[data-selected]': {
                    '&, &:hover': {
                      backgroundColor: theme.colors.gray[9],
                    //   color: theme.colors.teal[9],
                    },
                  },
            }
        })}
        itemComponent={SelectItem}
        color="red"
        // inputContainer={(children) => <Text color="purple">{children}</Text>}
        data={[
            {
                color: getColor("pending"),
                label: "В обработке",
                value: "pending"
            },
            {
                color: getColor("returnRequested"),
                label: "Запрос на возврат",
                value: "returnRequested"
            },
            {
                color: getColor("returned"),
                label: "Возвращено",
                value: "returned"
            },
            {
                color: getColor("complete"),
                label: "Завершен",
                value: "complete"
            }
        ]}
        value={value}
        onChange={onChange}
    //   searchable
    //   maxDropdownHeight={400}
    //   nothingFound="Nobody here"
    //   filter={(value, item) =>
    //     item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
    //     item.description.toLowerCase().includes(value.toLowerCase().trim())
    //   }
    />
}