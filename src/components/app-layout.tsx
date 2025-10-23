"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Activity, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Pages that should not have the sidebar/header layout
const STANDALONE_PAGES = ["/", "/login", "/signup", "/forgot-password"];

// Pages that should have header but no sidebar
const HEADER_ONLY_PAGES: string[] = [];

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setIsLoaded(true);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed, isLoaded]);

  // Check if current page should be standalone
  const isStandalone = STANDALONE_PAGES.includes(pathname);
  
  // Check if current page should have header only (no sidebar)
  const isHeaderOnly = HEADER_ONLY_PAGES.includes(pathname);

  // Get page metadata based on current route
  const getPageMetadata = () => {
    switch (pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          description: "Real-time overview of your Amazon case monitoring"
        };
      case "/workspaces":
        return {
          title: "Workspaces",
          description: "Manage your Amazon accounts and brands"
        };
      case "/cases":
        return {
          title: "Amazon Cases",
          description: "Track and manage all your Amazon cases"
        };
      case "/accounts":
        return {
          title: "Brands & Accounts",
          description: "Manage your brands and Amazon Seller Central account credentials securely. All passwords and 2FA keys are encrypted."
        };
      case "/analytics":
        return {
          title: "Analytics",
          description: "Insights and performance metrics for your cases"
        };
      case "/users":
        return {
          title: "User Management",
          description: "Manage user accounts and permissions"
        };
      default:
        return { title: undefined, description: undefined };
    }
  };

  const { title, description } = getPageMetadata();

  // Render standalone pages without sidebar/header
  if (isStandalone) {
    return <>{children}</>;
  }

  // Render header-only pages (no sidebar)
  if (isHeaderOnly) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            {/* Left side - Logo */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground hidden sm:block">
                  Case Pulse
                </span>
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* User Menu */}
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 transition-all duration-300 min-h-screen">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Header */}
      <Header
        isCollapsed={isCollapsed}
        onMenuClick={() => setIsMobileMenuOpen(true)}
        title={title}
        description={description}
      />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          title ? "pt-16 lg:pt-24" : "pt-16",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

