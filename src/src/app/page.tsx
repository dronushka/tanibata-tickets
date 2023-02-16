
import { Test } from '@/app/test-component'
import { AppShell, Header, Navbar } from '@mantine/core'
import { prisma } from 'prisma/db'

export default async function Page() {

  const users = await prisma.user.findMany()
  console.log(users)
  return <Test />
}