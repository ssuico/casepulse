"use client";

import { Button } from "@/components/ui/button";
import {
  Bell,
  User,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isCollapsed: boolean;
  onMenuClick: () => void;
  title?: string;
  description?: string;
}

export function Header({ isCollapsed, onMenuClick, title, description }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300 shadow-sm",
        isCollapsed ? "left-16" : "left-64",
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

          {/* User Menu */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

