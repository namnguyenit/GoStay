"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  ConciergeBell,
  Home,
  LogIn,
  LogOutIcon,
  PartyPopper,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageNavigation from "./ImageNavigation";
import { useSafeContext } from "@/shared/hooks";
import { HomeContext } from "../providers/home.provider";
import { CarouselSection, SearchInfoSection } from "@/shared/components";
import PlaceCarouselItem from "@/features/place/components/PlaceCarouselItem";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function HomeClient() {
  const {
    imageIndex,
    setImageIndex,
    clock,
    setClock,
    experiences,
    setExperiences,
    places,
  } = useSafeContext(HomeContext);

  useEffect(() => {
    if (clock) return;
    setClock(
      setInterval(() => {
        setImageIndex((prev: any) => {
          let i = prev + 1;
          if (i >= (experiences?.length ?? 0)) {
            i = 0;
          }
          return i;
        });
      }, 6000),
    );
    return () => clearInterval(clock ?? undefined);
  }, [clock]);

  const itemRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   itemRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "center", // hoặc "center"
  //   });
  // }, []);

  const [scrolled, setScrolled] = useState(false);

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
          scrolled ? "bg-app-primary" : "bg-transparent",
        )}
      >
        <div className="pos-center-y text-header left-10 hidden text-white sm:block">
          Logo
        </div>
        <Tabs
          // defaultValue="1"
          onValueChange={(value) => {
            console.log("Tab: ", value);
          }}
        >
          <TabsList
            variant="line"
            style={{ "--foreground": "white" } as CSSProperties}
          >
            <TabsTrigger value="1" className="data-[state=active]:text-white">
              <div className="center-y hover:text-app-accent text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <Home />
                <div className="w-2" />
                Nơi cư trú
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger value="2" className="data-[state=active]:text-white">
              <div className="center-y hover:text-app-accent text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <PartyPopper />
                <div className="w-2" />
                Trải nghiệm
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger value="3" className="data-[state=active]:text-white">
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
                scrolled ? "text-app-primary-fg" : "text-muted-foreground",
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
      <div className="center relative size-full">
        {/* BG */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="size-full scale-115 bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={experiences?.[imageIndex]?.id}
                initial={{ opacity: 0, x: "5%" }}
                animate={{ opacity: [0, 1, 1], x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="size-full"
              >
                <img
                  src={experiences?.[imageIndex]?.image ?? undefined}
                  alt=""
                  className="size-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0">
          <div className="blur-bottom size-full" />
        </div>
        {/* FG */}
        <div className="relative h-full w-18/19">
          {/* INFO */}
          <div className="pos-center-y">
            <motion.div
              key={experiences?.[imageIndex]?.id}
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              className="w-full"
            >
              <div>
                <div className="text-header text-white">
                  {experiences?.[imageIndex]?.name}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.price}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.address}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.rating}
                </div>
                <div className="h-[20]" />
                <Button className="text-title bg-app-primary hover:bg-app-accent w-[200]">
                  Xem chi tiết
                </Button>
              </div>
            </motion.div>
          </div>
          <div className="absolute right-0 bottom-1/6 w-full">
            <ImageNavigation />
          </div>
        </div>
        {/* Search Info */}
        <div className="pos-center-x bottom-[-30] w-6/10">
          <SearchInfoSection onClickSearch={console.log} />
        </div>
      </div>
      <div className="h-18" />
      <CarouselSection title="Địa điểm ưu chuộng">
        {places?.map((e, index) => (
          <PlaceCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Địa điểm ưu chuộng">
        {places?.map((e, index) => (
          <PlaceCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Địa điểm ưu chuộng">
        {places?.map((e, index) => (
          <PlaceCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
    </main>
  );
}
