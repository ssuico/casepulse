"use client";

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
  X,
  Package,
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
  }
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-gradient-to-b from-sidebar to-sidebar/95 shadow-xl lg:hidden">
        {/* Header */}
        <div className="relative flex h-16 items-center justify-between border-b border-border/50 px-5">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          
          <Link href="/" className="relative flex items-center space-x-3 group" onClick={onClose}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-lg transition-all duration-200">
              <Activity className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight">
                Case Pulse
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                Monitoring System
              </span>
            </div>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="relative z-10 hover:bg-sidebar-accent/60"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className={cn(sectionIndex > 0 && "mt-6")}>
              {/* Section Header */}
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                      )}
                      
                      {/* Icon with subtle animation */}
                      <div className={cn(
                        "flex items-center justify-center transition-transform duration-200",
                        !isActive && "group-hover:scale-110"
                      )}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      
                      {/* Label */}
                      <span className="flex-1">{item.name}</span>
                      
                      {/* Hover effect overlay */}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/3 to-transparent rounded-tr-full pointer-events-none" />
      </aside>
    </>
  );
}

