
import { Test } from '@/app/test-component'
import { AppShell, Header, Navbar } from '@mantine/core'
import { prisma } from "@/db"
import MakeOrder from '../components/order/make-order'

export default async function Page() {
  const venue = await prisma.venue.findFirst({
    where: {
      id: 1
    },
    include: {
      rows: {
        include: {
          tickets: {
            include: {
              priceRange: true
            }
          }
        }
      }
    }
  })

  // console.log(venue)

  return <MakeOrder venue={venue} />
}