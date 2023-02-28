import { ClientVenue } from "@/types/types"
import { Box, Button, Flex, Loader } from "@mantine/core"
import { useOrder } from "../use-order"
import Hall from "./hall"
import Stage from "./stage"
import Summary from "./summary"

export default function TicketsPicker({ venue }: { venue: ClientVenue }) {
    const { order, nextStage, prevStage, setOrder } = useOrder()

    if (!venue)
        return <Loader />

    return (
        <>
            <Flex sx={{
                flexDirection: "row"
            }}>
                <Box>
                    <Stage />
                    <Hall rows={venue.rows} />
                </Box>

                <Flex sx={{
                    alignItems: "center",
                    padding: 20
                }}>
                    <Summary />
                </Flex>
            </Flex>
            <Button variant="default" onClick={prevStage}>Назад</Button>
        </>
    )
}