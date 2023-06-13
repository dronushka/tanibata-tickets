import ClientLayout from "./ClientLayout"
import ClientProviders from "./ClientProviders"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en-US">
            <head />
            <body>
                <ClientProviders>
                    <ClientLayout>{children}</ClientLayout>
                </ClientProviders>
            </body>
        </html>
    )
}
