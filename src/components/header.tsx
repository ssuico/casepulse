"use client";

import { Button } from "@/components/ui/button";
import {
  Bell,
  User,
  Menu,
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

interface HeaderProps {
  isCollapsed: boolean;
  onMenuClick: () => void;
  title?: string;
  description?: string;
}

export function Header({ isCollapsed, onMenuClick, title, description }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  // Generate initials from email or name
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300 shadow-sm",
        isCollapsed ? "left-20" : "left-64",
        title ? "h-16 lg:h-24" : "h-16"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left side - Mobile Menu Button and Page Title */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Title and Description */}
          {title && (
            <div className="min-w-0 flex-1">
              {/* Desktop View */}
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
              {/* Mobile View */}
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
              </div>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                {user?.avatar ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt="User avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || "Guest"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    <span className="capitalize">{user?.role || "User"}</span>
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

