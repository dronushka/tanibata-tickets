import Link from "next/link"
import { NavLink } from "@mantine/core"
import {
    IconHome,
    IconTicket,
    IconHelp
} from "@tabler/icons-react"
import { usePathname  } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Navigation() {
    const pathname = usePathname()

    const { data: session, status } = useSession()

    if (session?.user.role === "admin")
        return <>
        <Link href="/dashboard" passHref legacyBehavior>
            <NavLink 
                component="a" 
                label="Зал"
                icon={<IconHome />} 
                active={pathname === "/dashboard"}
            />
        </Link>
        <Link href="/dashboard/orders" passHref legacyBehavior>
            <NavLink 
                component="a" 
                label="Заказы"
                icon={<IconTicket />} 
                active={pathname === "/dashboard/orders"}
            />
        </Link>
    </>
    
    return (
        <>
            <Link href="/" passHref legacyBehavior>
                <NavLink 
                    component="a" 
                    label="Главная"
                    icon={<IconHome />} 
                    active={pathname === "/"}
                />
            </Link>
            <Link href="/orders" passHref legacyBehavior>
                <NavLink 
                    component="a" 
                    label="Мои заказы"
                    icon={<IconTicket />} 
                    active={pathname === "/orders"}
                />
            </Link>
            <Link href="/help" passHref legacyBehavior>
                <NavLink 
                    component="a" 
                    label="Помощь"
                    icon={<IconHelp />}
                    active={pathname === "/help"}
                />
            </Link>
        </>
    )
}