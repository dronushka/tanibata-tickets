import Link from "next/link"
import { NavLink } from "@mantine/core"
import {
    IconHome,
    IconTicket,
    IconHelp,
    IconQrcode
} from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"

export default function Navigation({ onClick }: { onClick: () => void }) {
    const pathname = usePathname()

    const { data: session, status } = useSession()

    if (session?.user.role === Role.ADMIN)
        return <>
            <Link href="/dashboard" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Зал"
                    icon={<IconHome />}
                    active={pathname === "/dashboard"}
                    onClick={onClick}
                />
            </Link>
            <Link href="/dashboard/orders" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Заказы"
                    icon={<IconTicket />}
                    active={pathname === "/dashboard/orders"}
                    onClick={onClick}
                />
            </Link>
            <Link href="/dashboard/scan" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Сканер"
                    icon={<IconQrcode />}
                    active={pathname === "/dashboard/scan"}
                    onClick={onClick}
                />
            </Link>
        </>

    return (
        <>
            {/* <Link href="/" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Главная"
                    icon={<IconHome />}
                    active={pathname === "/"}
                    onClick={onClick}

                />
    </Link>*/}
            <Link href="/orders" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Мои заказы"
                    icon={<IconTicket />}
                    active={pathname === "/orders"}
                    onClick={onClick}
                />
            </Link>
            <Link href="/help" passHref legacyBehavior>
                <NavLink
                    component="a"
                    label="Помощь"
                    icon={<IconHelp />}
                    active={pathname === "/help"}
                    onClick={onClick}
                />
            </Link> 
        </>
    )
}