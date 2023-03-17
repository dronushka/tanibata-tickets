
"use client"

import { useState } from 'react'
import {
    AppShell,
    Navbar,
    Header,
    Footer,
    Aside,
    Text,
    MediaQuery,
    Burger,
    useMantineTheme,
} from '@mantine/core'
import Logo from '@/components/Logo'
import Navigation from '@/components/Navingation'
import User from '@/components/User'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const theme = useMantineTheme()
    const [opened, setOpened] = useState(false)
    return (
        <AppShell
            styles={{
                main: {
                    background: theme.colors.gray[0],
                },
            }}
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"

            // aside={
            //     <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
            //         <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
            //             <Text>Application sidebar</Text>
            //         </Aside>
            //     </MediaQuery>
            // }
            // footer={
            //     <Footer height={60} p="md">
            //         Application footer
            //     </Footer>
            // }
            header={
                <Header height={70} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                            <Burger
                                opened={opened}
                                onClick={() => setOpened((o) => !o)}
                                size="sm"
                                color={theme.colors.gray[6]}
                                mr="xl"
                            />
                        </MediaQuery>

                        <Logo />
                    </div>
                </Header>
            }
            navbar={
                <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened}  width={{ sm: 200, lg: 300 }}>
                    <Navbar.Section grow mt="md">
                        <Navigation onClick={ () => setOpened(false) }/>
                    </Navbar.Section>
                    <Navbar.Section>
                        <User />
                    </Navbar.Section>
                </ Navbar>
            }
        >
                { children }
        </AppShell>
    )
}