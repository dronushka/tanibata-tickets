import Link from "next/link"
import { NavLink } from "@mantine/core"
import {
    IconHome,
    IconTicket,
    IconHelp
} from "@tabler/icons-react"
import { usePathname  } from "next/navigation"

export default function Navigation() {
    const pathname = usePathname()

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