"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";

interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

interface NavGroup {
  title: string;
  key: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [authMessage, setAuthMessage] = useState("Authenticating...");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    partners: true,
    services: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/");
        return;
      }
      const roles = AuthService.getUserRoles();
      if (!roles.includes("ADMIN")) {
        setAuthMessage("Bạn không có quyền truy cập trang quản trị. Đang chuyển về trang chủ...");
        router.push("/");
        return;
      }
      const user = AuthService.getCurrentUser();
      if (user?.username) setAdminName(user.username);
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-semibold">{authMessage}</p>
        </div>
      </div>
    );
  }

  const navGroups: NavGroup[] = [
    {
      title: "PARTNER MANAGEMENT",
      key: "partners",
      items: [
        { href: "/admin/hosts", label: "Pending Hosts", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { href: "/admin/approved-hosts", label: "Approved Hosts", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { href: "/admin/enterprises", label: "Pending Enterprises", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
        { href: "/admin/approved-enterprises", label: "Approved Enterprises", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
      ],
    },
    {
      title: "SERVICES & INVENTORY",
      key: "services",
      items: [
        { href: "/admin/landmarks", label: "Landmarks", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { href: "/admin/listings", label: "Service Listings", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
        { href: "/admin/inventory", label: "Inventory", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
      ],
    },
  ];

  const getActiveItemLabel = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/users")) return "User Management";
    if (pathname.startsWith("/admin/payouts")) return "Payout Hosts";
    
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href)) {
          return item.label;
        }
      }
    }
    return "Admin Portal";
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sidebar - CrewMate Style */}
      <aside className="w-[280px] bg-white flex flex-col fixed top-0 left-0 h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Brand */}
        <div className="h-[90px] flex items-center px-8 border-b border-slate-100/50">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[15px] tracking-tighter border border-blue-100/30">
              G<span className="text-blue-400">S</span>
            </div>
            <span className="font-semibold text-[20px] tracking-tight text-slate-800">
              GoStay
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-5 space-y-1 scrollbar-hide">
          
          <div className="px-3 pt-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>

          <Link
            href="/admin"
            className={`flex items-center px-4 py-2.5 mb-1.5 rounded-xl text-[13.5px] font-semibold transition-all ${
              pathname === "/admin"
                ? "bg-[#f4f7fe] text-blue-600 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center px-4 py-2.5 mb-1.5 rounded-xl text-[13.5px] font-semibold transition-all ${
              pathname.startsWith("/admin/users")
                ? "bg-[#f4f7fe] text-blue-600 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            User Management
          </Link>

          <Link
            href="/admin/payouts"
            className={`flex items-center px-4 py-2.5 mb-6 rounded-xl text-[13.5px] font-semibold transition-all ${
              pathname.startsWith("/admin/payouts")
                ? "bg-[#f4f7fe] text-blue-600 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Payout Hosts
          </Link>

          {/* Groups */}
          {navGroups.map((group) => {
            const isOpen = openGroups[group.key];
            return (
              <div key={group.key} className="mb-4">
                <div 
                  className="px-3 pt-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center cursor-pointer"
                  onClick={() => toggleGroup(group.key)}
                >
                  {group.title}
                  <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
                
                {isOpen && (
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                            isActive
                              ? "bg-[#f4f7fe] text-blue-600 font-bold"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {item.icon ? item.icon : <span className={`w-1.5 h-1.5 rounded-full mr-3.5 ${isActive ? 'bg-blue-500' : 'bg-transparent'}`}></span>}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-6 pb-8">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100/60">
            <div className="flex items-center gap-3">
              <Image
                unoptimized
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                alt="Avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
              />
              <div>
                <p className="text-[13px] font-semibold text-slate-800 capitalize">{adminName || "Admin"}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">System Admin</p>
              </div>
            </div>
            <button
              onClick={() => {
                AuthService.logout();
                router.push("/");
              }}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="h-[90px] flex items-center justify-between px-10 sticky top-0 z-10 bg-[#f8f9fa]/80 backdrop-blur-md">
          
          {/* Breadcrumb / Title */}
          <div>
            <h1 className="text-[20px] font-semibold text-slate-800 tracking-tight">
              {getActiveItemLabel()}
            </h1>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-4">
            
            {/* Search Topbar */}
            <div className="hidden lg:flex items-center relative">
              <svg className="w-3.5 h-3.5 absolute left-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Tìm kiếm tác vụ..." className="pl-9 pr-4 py-2 bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full text-[12px] font-semibold text-slate-700 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-slate-200 transition-all" />
            </div>

            <button className="w-9 h-9 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:text-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </button>
            
            <button className="w-9 h-9 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:text-slate-700 transition-colors relative">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <button className="w-9 h-9 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:text-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="px-10 pb-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
