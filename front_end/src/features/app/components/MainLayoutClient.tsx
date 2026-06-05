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
import clsx from "clsx";
import {
  ConciergeBell,
  Globe2,
  Heart,
  Home,
  LoaderCircle,
  LogIn,
  LogOutIcon,
  Menu,
  PartyPopper,
  Search,
  SettingsIcon,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { ReactNode, useEffect, useState, useTransition } from "react";
import { isTab, useApp } from "../hooks/useApp";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { Footer } from "@/shared/components";
import CartDrawer from "@/shared/components/CartDrawer";
import { useCart } from "@/shared/context/CartContext";
import { useAuthModal } from "@/shared/context/AuthModalContext";

const NAV_ITEMS = [
  { value: "place", label: "Nơi lưu trú", icon: Home },
  { value: "experience", label: "Trải nghiệm", icon: PartyPopper },
  { value: "service", label: "Dịch vụ", icon: ConciergeBell },
] as const;

type CurrentUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
} | null;

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
  const [currentUser, setCurrentUser] = useState<CurrentUser>(
    () => AuthService.getCurrentUser() as CurrentUser,
  );
  const { itemCount, setIsDrawerOpen } = useCart();
  const { openModal } = useAuthModal();

  const roles = currentUser ? AuthService.getUserRoles() : [];
  const isHost = roles.includes("HOST");
  const isEnterprise = roles.includes("ENTERPRISE");
  const isHomePage = pathName === "/";
  const elevatedHeader =
    scrolled ||
    Boolean(tab) ||
    pathName.startsWith("/search") ||
    pathName.startsWith("/settings") ||
    pathName.startsWith("/checkout") ||
    pathName.startsWith("/payment");

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const rolesChanged = await AuthService.refreshRoles();
        if (rolesChanged) {
          const refreshedUser = AuthService.getCurrentUser() as CurrentUser;
          setCurrentUser(refreshedUser ? { ...refreshedUser } : null);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser]);

  useEffect(() => {
    const segment = pathName.split("/")[1];
    if (isTab(segment)) {
      setTab(segment);
    } else {
      setTab(undefined);
    }
  }, [pathName, setTab]);

  const goHome = () => {
    startTransition(() => {
      setTab(undefined);
      router.push("/");
    });
  };

  const goToTab = (value: (typeof NAV_ITEMS)[number]["value"]) => {
    startTransition(() => {
      router.push(`/${value}`);
    });
  };

  const openLogin = () => openModal("login");

  return (
    <main
      className="no-scrollbar h-screen overflow-x-hidden overflow-y-auto bg-white text-[#222222]"
      onScroll={(event) => {
        const top = (event.target as HTMLDivElement).scrollTop;
        setScrolled(top > 50);
      }}
    >
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 border-b border-[#DDDDDD] bg-white/95 backdrop-blur transition-shadow duration-200",
          elevatedHeader ? "shadow-sm" : "shadow-none",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1760px] items-center justify-between px-6 md:px-10 xl:px-20">
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2 rounded-full text-[#FF385C] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#222222]"
            aria-label="Về trang chủ GoStay"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF385C] text-white">
              <Home className="h-5 w-5" />
            </span>
            <span className="hidden text-2xl font-bold tracking-normal sm:block">
              GoStay
            </span>
          </button>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
            aria-label="Loại hình dịch vụ"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => goToTab(item.value)}
                  className={clsx(
                    "group relative flex items-center gap-2 px-1 py-2 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#222222]",
                    isActive
                      ? "font-semibold text-[#222222]"
                      : "font-normal text-[#717171] hover:text-[#222222]",
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-[#222222]" : "text-[#717171]",
                    )}
                  />
                  <span>{item.label}</span>
                  <span
                    className={clsx(
                      "absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#222222] transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50",
                    )}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="hidden h-11 items-center gap-3 rounded-full border border-[#DDDDDD] bg-white py-2 pl-4 pr-2 text-sm font-semibold text-[#222222] shadow-sm transition hover:shadow-md lg:flex"
              aria-label="Mở tìm kiếm"
            >
              <span>Địa điểm bất kỳ</span>
              <span className="h-5 w-px bg-[#DDDDDD]" />
              <span>Thêm ngày</span>
              <span className="h-5 w-px bg-[#DDDDDD]" />
              <span className="font-normal text-[#717171]">Thêm khách</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF385C] text-white">
                <Search className="h-4 w-4" />
              </span>
            </button>

            {(isHost || isEnterprise) && currentUser && (
              <div className="hidden items-center gap-2 xl:flex">
                {isHost && (
                  <Link href="/host">
                    <Button
                      variant="ghost"
                      className="h-10 rounded-full px-4 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Kênh Chủ Nhà
                    </Button>
                  </Link>
                )}
                {isEnterprise && (
                  <Link href="/enterprise">
                    <Button
                      variant="ghost"
                      className="h-10 rounded-full px-4 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Kênh Doanh Nghiệp
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="hidden h-10 w-10 rounded-full text-[#222222] hover:bg-[#F7F7F7] md:inline-flex"
              title="Ngôn ngữ"
            >
              <Globe2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full text-[#222222] hover:bg-[#F7F7F7]"
              onClick={() => setIsDrawerOpen(true)}
              title="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF385C] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#DDDDDD] bg-white py-1 pl-3 pr-1.5 text-[#222222] shadow-sm hover:shadow-md"
                  aria-label="Mở menu tài khoản"
                >
                  <Menu className="h-5 w-5" />
                  {currentUser ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          currentUser.avatarUrl ||
                          "https://github.com/shadcn.png"
                        }
                      />
                      <AvatarFallback className="bg-[#717171] text-xs font-bold text-white">
                        {currentUser.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserCircle className="h-8 w-8 text-[#717171]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                {currentUser ? (
                  <>
                    <div className="px-2 py-2">
                      <div className="text-sm font-semibold text-[#222222]">
                        {currentUser.lastName} {currentUser.firstName}
                      </div>
                      <div className="mt-0.5 text-xs text-[#717171]">
                        {roles.join(", ")}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="cursor-pointer gap-2"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Cài đặt tài khoản
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer gap-2 text-[#E61E4F]"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={openLogin}
                      className="cursor-pointer gap-2 font-semibold"
                    >
                      <LogIn className="h-4 w-4" />
                      Đăng nhập
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      Đón tiếp khách
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Trung tâm trợ giúp
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {tab && <div className="h-20" />}

      {isPending && (
        <div className="center size-full">
          <div className="row gap-2 text-[#FF385C]">
            <LoaderCircle className="animate-spin" />
            Loading...
          </div>
        </div>
      )}

      {!isPending && (
        <>
          <CartDrawer />
          {children}
          <Footer />
        </>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-[#DDDDDD] bg-white md:hidden">
        <button
          type="button"
          onClick={goHome}
          className={clsx(
            "flex flex-col items-center gap-1 text-[10px] font-semibold",
            isHomePage ? "text-[#FF385C]" : "text-[#717171]",
          )}
        >
          <Search className="h-5 w-5" />
          Khám phá
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#717171]"
        >
          <Heart className="h-5 w-5" />
          Yêu thích
        </button>
        <button
          type="button"
          onClick={currentUser ? () => router.push("/settings") : openLogin}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#717171]"
        >
          <UserCircle className="h-5 w-5" />
          {currentUser ? "Tài khoản" : "Đăng nhập"}
        </button>
      </nav>
    </main>
  );
}
