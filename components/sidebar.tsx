"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  FileTextIcon,
  HomeIcon,
  MenuIcon,
  PercentIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Members",
    href: "/members",
    icon: UsersIcon,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: WalletIcon,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileTextIcon,
  },
  {
    title: "Dividends",
    href: "/dividends",
    icon: PercentIcon,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: BarChart3Icon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const NavItems = () => (
    <div className="space-y-1 px-3">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn("w-full justify-start", pathname === item.href && "bg-muted")}
          asChild
          onClick={() => setOpen(false)}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-5 w-5" />
            {item.title}
          </Link>
        </Button>
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full shadow-lg">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 pt-10">
            <NavItems />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="fixed top-16 bottom-0 left-0 z-20 hidden w-64 border-r bg-background pt-4 md:block">
        <NavItems />
      </div>
    </>
  )
}
