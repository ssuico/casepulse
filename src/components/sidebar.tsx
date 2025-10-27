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
  Sparkles,
  Package,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationSections = [
  {
    title: "Main",
    items: [
      // {
      //   name: "Dashboard",
      //   href: "/dashboard",
      //   icon: LayoutDashboard,
      // },
      {
        name: "Amazon Cases",
        href: "/cases",
        icon: FileText,
      },
      {
        name: "Brands & Accounts",
        href: "/accounts",
        icon: Package,
      },
    ]
  },
  {
    title: "Management",
    items: [
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
    ]
  },
  {
    title: "Settings",
    items: [
      {
        name: "Puppeteer Configuration",
        href: "/puppeteer-config",
        icon: Settings,
      },
    ]
  }
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
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar/95 transition-all duration-300 shadow-lg",
        isCollapsed ? "w-20" : "w-[18%]"
      )}
    >
      {/* Header Section with Logo */}
      <div className={cn(
        "relative h-16 lg:h-24 border-b border-white/10",
        isCollapsed ? "flex items-center justify-center px-2" : "flex items-center justify-between px-5"
      )}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
        
        {!isCollapsed ? (
          <Link href="/" className="relative flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-white to-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.12)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-all duration-200 group-hover:scale-105">
              <Activity className="h-6 w-6 text-[#3867d6]" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-[#3867d6]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                Case Pulse
              </span>
              <span className="text-[10px] text-white/80 font-medium tracking-wide uppercase">
                Monitoring System
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="relative flex items-center justify-center w-full group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-white to-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.12)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-all duration-200 group-hover:scale-105">
              <Activity className="h-6 w-6 text-[#3867d6]" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-full bg-[#3867d6]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Section with Scrollable Content */}
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <nav className={cn("flex-1 py-6", isCollapsed ? "px-2" : "px-3")}>
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Divider before section (except first one) */}
              {sectionIndex > 0 && (
                <div className={cn(
                  "relative my-6",
                  isCollapsed ? "px-2" : "px-3"
                )}>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              )}
              
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              
              {/* Section Items */}
              <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]",
                        isCollapsed && "justify-center w-12 h-12 p-0 rounded-xl"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {/* Active indicator */}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full" />
                      )}
                      
                      {/* Icon with subtle animation */}
                      <div className={cn(
                        "flex items-center justify-center transition-transform duration-200",
                        !isActive && "group-hover:scale-110"
                      )}>
                        <Icon className={cn(
                          isCollapsed ? "h-5 w-5" : "h-4 w-4",
                          "flex-shrink-0"
                        )} strokeWidth={2.5} />
                      </div>
                      
                      {/* Label */}
                      {!isCollapsed && (
                        <span className="flex-1">{item.name}</span>
                      )}
                      
                      {/* Hover effect overlay */}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section - Collapse Toggle */}
        <div className={cn(
          "border-t border-white/10",
          isCollapsed ? "py-4 px-2" : "py-4 px-4"
        )}>
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "group relative w-full rounded-lg hover:bg-sidebar-accent transition-all duration-200",
              isCollapsed ? "h-12 p-0 justify-center" : "h-10 px-3 justify-start"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="flex items-center gap-3 text-white/80 group-hover:text-white">
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={2.5} />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
    </aside>
  );
}

