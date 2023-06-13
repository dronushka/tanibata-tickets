"use client"

import { CacheProvider } from "@emotion/react"
import { useEmotionCache, MantineProvider } from "@mantine/core"
import { SessionProvider } from "next-auth/react"
import { useServerInsertedHTML } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { useState } from "react"
import { trpc } from "@/lib/trpc/trpc"

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode
}) {
    const cache = useEmotionCache()
    cache.compat = true

    useServerInsertedHTML(() => (
        <style
            data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(
                " "
            )}`}
            dangerouslySetInnerHTML={{
                __html: Object.values(cache.inserted).join(" "),
            }}
        />
    ))

    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc",
                }),
            ],
        })
    )

    return (
        <SessionProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <CacheProvider value={cache}>
                        <MantineProvider withGlobalStyles withNormalizeCSS>
                            {children}
                        </MantineProvider>
                    </CacheProvider>
                </QueryClientProvider>
            </trpc.Provider>
        </SessionProvider>
    )
}
