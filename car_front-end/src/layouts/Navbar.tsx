import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/presentation/context/AuthContext";
import {
  Bus,
  Search,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout, isOperator } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const displayName = user ? user.getDisplayName() : "Tài khoản";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-sm">
              <Bus className="h-5 w-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                GoStay
              </span>
              <Badge
                variant="secondary"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                Xe Khách
              </Badge>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "font-semibold text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Tìm chuyến xe</span>
            </Link>

            <Link
              to="/cars"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                isActive("/cars")
                  ? "font-semibold text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Bus className="h-4 w-4" />
              <span>Danh sách xe</span>
            </Link>
          </nav>

          {/* Right Action & User Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-auto items-center space-x-2 rounded-full px-2 py-1.5 hover:bg-blue-50"
                    >
                      <Avatar className="h-8 w-8 border border-blue-200 bg-blue-600">
                        <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate text-xs font-bold text-gray-800">
                        {displayName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {displayName}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {user.email || `@${user.username}`}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isOperator && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          to="/operator/dashboard"
                          className="flex w-full items-center"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Kênh Nhà Xe</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Trang cá nhân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/login" className="flex w-full items-center">
                        <LogIn className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Đăng nhập</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-gray-700 hover:text-blue-600"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  >
                    <span>Đăng ký</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
