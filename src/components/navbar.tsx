"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Activity,
  Bell,
  User
} from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Case Pulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-sidebar-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/workspaces" 
              className="text-sm font-medium text-sidebar-foreground hover:text-foreground transition-colors"
            >
              Workspaces
            </Link>
            <Link 
              href="/cases" 
              className="text-sm font-medium text-sidebar-foreground hover:text-foreground transition-colors"
            >
              Cases
            </Link>
            <Link 
              href="/analytics" 
              className="text-sm font-medium text-sidebar-foreground hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </Button>

            {/* User Menu */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-base font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/workspaces"
                className="block px-3 py-2 text-base font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Workspaces
              </Link>
              <Link
                href="/cases"
                className="block px-3 py-2 text-base font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cases
              </Link>
              <Link
                href="/analytics"
                className="block px-3 py-2 text-base font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
