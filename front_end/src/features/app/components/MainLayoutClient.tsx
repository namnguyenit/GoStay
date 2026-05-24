"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import {
  ConciergeBell,
  Home,
  LoaderCircle,
  LogIn,
  LogOutIcon,
  PartyPopper,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
  useTransition,
} from "react";
import { isTab, useApp } from "../hooks/useApp";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MainLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const { tab, setTab } = useApp();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathName = usePathname();

  useEffect(() => {
    const segment = pathName.split("/")[1];
    if (isTab(segment)) {
      setTab(segment);
    }
  }, [pathName]);

  return (
    <main
      className="scrollbar h-screen overflow-x-hidden overflow-y-auto"
      onScroll={(event) => {
        if ((event.target as HTMLDivElement).scrollTop > 50) setScrolled(true);
        if ((event.target as HTMLDivElement).scrollTop <= 50)
          setScrolled(false);
      }}
    >
      {/* MAIN NAVIGATION */}
      <div
        className={clsx(
          "center fixed z-10 h-[70] transition-colors duration-700",
          scrolled || tab ? "bg-app-primary" : "bg-transparent",
        )}
      >
        <div
          className="pos-center-y text-header left-10 hidden text-white sm:block"
          onClick={() => {
            startTransition(() => {
              setTab(undefined);
              router.push("/");
            });
          }}
        >
          Logo
        </div>

        <Tabs
          // defaultValue="1"
          value={tab ?? ""}
          onValueChange={(value) => {
            startTransition(() => {
              router.push(`/${value}`);
            });
          }}
        >
          <TabsList
            variant="line"
            style={{ "--foreground": "white" } as CSSProperties}
          >
            <TabsTrigger
              value="place"
              className="data-[state=active]:text-white"
            >
              <div className="center-y hover:text-app-accent text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <Home />
                <div className="w-2" />
                Nơi cư trú
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger
              value="experience"
              className="data-[state=active]:text-white"
            >
              <div className="center-y hover:text-app-accent text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <PartyPopper />
                <div className="w-2" />
                Trải nghiệm
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger
              value="service"
              className="data-[state=active]:text-white"
            >
              <div className="center-y hover:text-app-accent text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <ConciergeBell />
                <div className="w-2" />
                Dịch vụ
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="row pos-center-y right-10 hidden gap-3 sm:flex">
          <div>
            <p className="text-sm font-medium text-white text-shadow-gray-400 text-shadow-md">
              Le Duc Long
            </p>
            <p
              className={clsx(
                "text-xs transition-colors duration-700",
                scrolled || tab
                  ? "text-app-primary-fg"
                  : "text-muted-foreground",
              )}
            >
              Admin
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>LL</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
              <Link href="/log-in">
                <DropdownMenuItem>
                  <LogIn />
                  Log In
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {tab && <div className="h-[70]"></div>}
      {isPending && (
        <div className="center size-full">
          <div className="text-app-primary/50 row gap-1">
            <LoaderCircle className="animate-spin" />
            Loading...
          </div>
        </div>
      )}
      {!isPending && children}
    </main>
  );
}
