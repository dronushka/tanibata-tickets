import { AppShell, Header, Navbar } from '@mantine/core'
import ClientLayout from './client-layout'
import RootStyleRegistry from './emotion'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head />
      <body>
        <RootStyleRegistry>
          <ClientLayout>
            {children}
          </ClientLayout>
        </RootStyleRegistry>
      </body>
    </html>
  )
}