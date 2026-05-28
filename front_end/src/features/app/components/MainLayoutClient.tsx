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
  Compass,
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
import AuthService from "@/services/auth.service";
import { Footer } from "@/shared/components";

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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser());
  }, [pathName]); // Cập nhật user info khi đổi route (ví dụ sau khi login xong)

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    router.push("/log-in");
  };

  useEffect(() => {
    const segment = pathName.split("/")[1];
    if (isTab(segment)) {
      setTab(segment);
    } else {
      setTab(undefined);
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
          "fixed z-50 flex w-full items-center justify-between px-6 md:px-10 transition-all duration-500",
          scrolled || tab || pathName.startsWith("/search")
            ? "h-[64] bg-gradient-to-r from-violet-700 via-app-primary to-purple-700 shadow-lg shadow-violet-900/20 backdrop-blur-md"
            : "h-[70] bg-transparent",
        )}
      >
        {/* Left: Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => {
            startTransition(() => {
              setTab(undefined);
              router.push("/");
            });
          }}
        >
          {/* Logo Icon */}
          <div className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 shadow-md group-hover:scale-105",
            scrolled || tab || pathName.startsWith("/search")
              ? "bg-white/20 border-white/25 group-hover:bg-white/30"
              : "bg-white/10 border-white/15 backdrop-blur-sm group-hover:bg-white/20"
          )}>
            <Compass className="h-5 w-5 text-white transition-transform duration-700 group-hover:rotate-180" />
          </div>
          {/* Logo Text */}
          <div className="hidden sm:flex flex-col justify-center leading-none">
            <span className="text-lg font-black tracking-wider text-white flex items-center">
              Go<span className="text-violet-200 font-extrabold">Travel</span>
            </span>
            <span className="text-[7px] font-bold tracking-[0.2em] text-white/40 uppercase mt-0.5">
              Khám phá Việt Nam
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <Tabs
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
            className="gap-0.5"
          >
            <TabsTrigger
              value="place"
              className="data-[state=active]:text-white after:hidden"
            >
              <div className={clsx(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                "text-white/80 hover:text-white hover:bg-white/10",
                tab === "place" && "bg-white/15 text-white"
              )}>
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Nơi cư trú</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="data-[state=active]:text-white after:hidden"
            >
              <div className={clsx(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                "text-white/80 hover:text-white hover:bg-white/10",
                tab === "experience" && "bg-white/15 text-white"
              )}>
                <PartyPopper className="h-4 w-4" />
                <span className="hidden md:inline">Trải nghiệm</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className="data-[state=active]:text-white after:hidden"
            >
              <div className={clsx(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                "text-white/80 hover:text-white hover:bg-white/10",
                tab === "service" && "bg-white/15 text-white"
              )}>
                <ConciergeBell className="h-4 w-4" />
                <span className="hidden md:inline">Dịch vụ</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right: User Section */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-tight">
                  {currentUser.lastName} {currentUser.firstName}
                </p>
                <p
                  className={clsx(
                    "text-[10px] font-medium leading-tight transition-colors duration-500",
                    scrolled || tab
                      ? "text-violet-200/70"
                      : "text-white/50",
                  )}
                >
                  {AuthService.getUserRoles().join(", ")}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative">
                    <div className="rounded-full p-[2px] bg-gradient-to-br from-violet-300 via-white/50 to-purple-400">
                      <Avatar className="h-8 w-8 border-2 border-transparent">
                        <AvatarImage
                          src={
                            currentUser.avatarUrl ||
                            "https://github.com/shadcn.png"
                          }
                        />
                        <AvatarFallback className="bg-violet-600 text-white text-xs font-bold">
                          {currentUser.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-violet-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem>
                    <UserIcon />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/log-in">
              <Button className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
              </Button>
            </Link>
          )}
        </div>

        {/* Bottom gradient line */}
        <div className={clsx(
          "absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500",
          scrolled || tab || pathName.startsWith("/search")
            ? "opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "opacity-0"
        )} />
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
      {!isPending && (
        <>
          {children}
          <Footer />
        </>
      )}
    </main>
  );
}
