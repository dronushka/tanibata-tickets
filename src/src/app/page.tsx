
import { Test } from '@/app/test-component'
import { AppDataSource } from '@/data-source'
import { User } from '@/entity/User'
import { AppShell, Header, Navbar } from '@mantine/core'

export default async function Page() {
  AppDataSource.initialize().then(async () => {
    const users = await AppDataSource.manager.find(User)
    console.log(users)

  }).catch(error => console.log(error))
  return <Test />
}