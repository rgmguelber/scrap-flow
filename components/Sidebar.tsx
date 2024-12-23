"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CoinsIcon,
  HomeIcon,
  Layers2Icon,
  MenuIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import Logo from "./Logo";

const routes = [
  {
    href: "/",
    label: "Home",
    icon: HomeIcon,
  },
  {
    href: "/workflows",
    label: "Workflows",
    icon: Layers2Icon,
  },
  {
    href: "/credentials",
    label: "Credentials",
    icon: ShieldCheckIcon,
  },

  {
    href: "/billing",
    label: "Billing",
    icon: CoinsIcon,
  },
];

function DesktopSideBar() {
  const pathName = usePathname();

  return (
    <div className="hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-2 border-separate ">
      <div className="flex items-center justify-center gap-2 border-b-[1px] border-separate p-4">
        <Logo />
      </div>

      <div className="p-2">TODO CREDITIS</div>

      <div className="flex flex-col p-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={buttonVariants({
              variant:
                pathName === route.href ? "siderbarActiveItem" : "siderbarItem",
            })}
          >
            <route.icon size={20} />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MobileSideBar() {
  const [isOpen, setOpen] = useState(false);
  const pathName = usePathname();

  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>

          <div className="hidden">
            <SheetTitle />
            <SheetDescription />
          </div>

          <SheetContent
            className="w-[400px] sm:w-[540px] space-y-4"
            side="left"
          >
            <Logo />

            <div className="flex flex-col gap-1">
              {routes.map((route) => {
                if (pathName === route.href) {
                  console.log("@route.href", route.href);
                  console.log("@pathName", pathName);
                }

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={buttonVariants({
                      variant:
                        pathName === route.href
                          ? "siderbarActiveItem"
                          : "siderbarItem",
                    })}
                    onClick={() => setOpen((prev) => !prev)}
                  >
                    <route.icon size={20} />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export default DesktopSideBar;
