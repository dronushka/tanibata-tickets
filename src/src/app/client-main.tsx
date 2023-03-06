"use client"
import FullPageMessage from "@/components/full-page-message"
import { Box, Button, Stack, Text } from "@mantine/core"
import { Venue } from "@prisma/client"
import Link from "next/link"

export default function ClientMain({ venues }: { venues: (Omit<Venue, "start"> & { start: string })[] }) {
    return <FullPageMessage>
        <Stack>
            <Text>Бла, бла, бла важная информация</Text>
            {venues.map(venue => <>
                <Text fw="bold">{venue.name}</Text>
                <Text>{venue.description}</Text>
                <Link href={"/orders/make?venue=" + venue.id} passHref legacyBehavior>
                    <Button component="a">Купить билеты</Button>
                </Link>
            </>)}

        </Stack>
    </FullPageMessage>
}