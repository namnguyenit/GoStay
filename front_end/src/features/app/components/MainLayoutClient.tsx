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
import AuthService from "@/services/auth.service";

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

  const roles = currentUser ? AuthService.getUserRoles() : [];
  const isHost = roles.includes("HOST");
  const isEnterprise = roles.includes("ENTERPRISE");

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
          {currentUser ? (
            <>
              {isHost && (
                <Link href="/host">
                  <Button 
                    className="bg-app-accent hover:bg-app-accent/80 text-[#7c3aed] font-semibold text-xs rounded-xl shadow-md h-9 px-4 cursor-pointer mr-1"
                  >
                    Kênh Chủ Nhà
                  </Button>
                </Link>
              )}
              {isEnterprise && (
                <Link href="/enterprise">
                  <Button 
                    className="bg-app-accent hover:bg-app-accent/80 text-[#7c3aed] font-semibold text-xs rounded-xl shadow-md h-9 px-4 cursor-pointer mr-1"
                  >
                    Kênh Doanh Nghiệp
                  </Button>
                </Link>
              )}
              <div>
                <p className="text-sm font-medium text-white text-shadow-gray-400 text-shadow-md">
                  {currentUser.lastName} {currentUser.firstName}
                </p>
                <p
                  className={clsx(
                    "text-xs transition-colors duration-700",
                    scrolled || tab
                      ? "text-app-primary-fg"
                      : "text-muted-foreground",
                  )}
                >
                  {AuthService.getUserRoles().join(", ")}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src={currentUser.avatarUrl || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{currentUser.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push("/settings?tab=profile")}>
                    <UserIcon />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings?tab=settings")}>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/log-in">
              <Button variant="secondary" className="font-semibold shadow-md">
                <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
              </Button>
            </Link>
          )}
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
