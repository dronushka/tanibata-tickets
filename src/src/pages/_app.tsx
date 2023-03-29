import { useState } from 'react'
import type { AppType } from 'next/app'
import NextApp, { AppProps, AppContext } from 'next/app'
import Head from 'next/head'
import { trpc } from '../lib/trpc'
import { MantineProvider } from '@mantine/core'

const App: AppType = ({ Component, pageProps }) => 
    <>
      <Head>
        <title>Нян-Фест 2023</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>


      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Component {...pageProps} />
      </MantineProvider>
    </>

export default trpc.withTRPC(App)