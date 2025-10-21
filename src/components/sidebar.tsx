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
  ChevronLeft,
  ChevronRight,
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
    name: "Cases",
    href: "/cases",
    icon: FileText,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: User,
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
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 lg:h-24 items-center justify-between border-b border-border px-4">
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
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-2 p-4 mt-6">
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
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full hover:bg-sidebar-accent text-sidebar-foreground rounded-xl py-3",
            isCollapsed ? "justify-center px-2" : "justify-start px-4"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

