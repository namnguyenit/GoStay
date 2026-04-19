"use client";

import { Button } from "@/components/ui/button";

import { useContext, useEffect, useRef, useState } from "react";
import { CSSProperties } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ConciergeBell, Home, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceContext } from "@/provider/service";
import ServiceImageNavigation from "@/features/service/components/ServiceImageNavigation";
import { HomeContext } from "@/provider/home";
import { useSafeContext } from "@/hooks";

export default function HomeClient() {
  const {
    serviceData,
    setServiceData,
    imageIndex,
    setImageIndex,
    clock,
    setClock,
  } = useSafeContext(ServiceContext);

  useEffect(() => {
    if (clock) return;
    setClock(
      setInterval(() => {
        setImageIndex((prev: any) => {
          let i = prev + 1;
          if (i >= (serviceData?.length ?? 0)) {
            i = 0;
          }
          return i;
        });
      }, 6000),
    );
    return () => clearInterval(clock ?? undefined);
  }, [clock]);

  return (
    <main className="scrollbar h-screen overflow-x-hidden overflow-y-auto">
      {/* MAIN NAVIGATION */}
      <div className="center bg-col fixed z-10 h-[60]">
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
              <div className="center-y hover:text-app-primary text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <Home />
                <div className="w-2" />
                Nơi cư trú
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger value="2" className="data-[state=active]:text-white">
              <div className="center-y hover:text-app-primary text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
                <PartyPopper />
                <div className="w-2" />
                Trải nghiệm
              </div>
            </TabsTrigger>
            <div className="w-1" />
            <TabsTrigger value="3" className="data-[state=active]:text-white">
              <div className="center-y hover:text-app-primary text-white text-shadow-gray-400 text-shadow-md hover:text-shadow-none">
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
            <p className="text-muted-foreground text-xs">Admin</p>
          </div>

          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>LL</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="center relative size-full overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 scale-115 bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={serviceData?.[imageIndex]?.id}
              initial={{ opacity: 0, x: "5%" }}
              animate={{ opacity: [0, 1, 1], x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="size-full"
            >
              <img
                src={serviceData?.[imageIndex]?.image ?? undefined}
                alt=""
                className="size-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
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
              key={serviceData?.[imageIndex]?.id}
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              className="w-full"
            >
              <div>
                <div className="text-header text-white">
                  {serviceData?.[imageIndex]?.name}
                </div>
                <div className="text-content text-white">
                  {serviceData?.[imageIndex]?.price}
                </div>
                <div className="text-content text-white">
                  {serviceData?.[imageIndex]?.address}
                </div>
                <div className="text-content text-white">
                  {serviceData?.[imageIndex]?.rating}
                </div>
                <div className="h-[20]" />
                <Button className="text-title bg-app-primary hover:bg-app-accent w-[200]">
                  Xem chi tiết
                </Button>
              </div>
            </motion.div>
          </div>
          {/* IMAGE NAVIGATION */}
          <div className="absolute right-0 bottom-1/12 w-full">
            <ServiceImageNavigation />
          </div>
        </div>
      </div>
      <div>Some thing...</div>
    </main>
  );
}
