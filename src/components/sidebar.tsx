"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Activity,
  LayoutDashboard,
  FolderKanban,
  FileText,
  BarChart3,
  User,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  // {
  //   name: "Dashboard",
  //   href: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  // {
  //   name: "Workspaces",
  //   href: "/workspaces",
  //   icon: FolderKanban,
  // },
  {
    name: "Amazon Cases",
    href: "/cases",
    icon: FileText,
  },
  {
    name: "Brands & Accounts",
    href: "/accounts",
    icon: User,
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
  },
  // {
  //   name: "Analytics",
  //   href: "/analytics",
  //   icon: BarChart3,
  // },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar/80 transition-all duration-300 shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className={cn("flex h-16 lg:h-24 items-center border-b border-border", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Case Pulse
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Section */}
      <nav className={cn("flex-1 space-y-2 mt-6", isCollapsed ? "p-2 flex flex-col items-center" : "p-4")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center w-12 h-12 p-0 rounded-full"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn(isCollapsed ? "h-6 w-6" : "h-5 w-5", "flex-shrink-0")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-14 h-14 p-0 rounded-full justify-center hover:bg-sidebar-accent text-sidebar-foreground"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-7 w-7" />
          ) : (
            <PanelLeftClose className="h-7 w-7" />
          )}
        </Button>
      </div>
    </aside>
  );
}

