"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flask,
  Pill,
  AlertCircle,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen border-r bg-card transition-all duration-300 shrink-0",
      collapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b">
          {!collapsed && (
            <div className="font-semibold text-xl text-primary">
              MedDash
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-3">
            {!collapsed ? (
              <>
                <NavItem
                  href="/"
                  icon={<Home size={20} />}
                  label="Vue d'Ensemble"
                  isActive={pathname === "/"}
                />
                <NavItem
                  href="/laboratoire"
                  icon={<Flask size={20} />}
                  label="Laboratoire"
                  isActive={pathname === "/laboratoire"}
                />
                <NavItem
                  href="/prescriptions"
                  icon={<Pill size={20} />}
                  label="Prescriptions"
                  isActive={pathname === "/prescriptions"}
                />
                <NavItem
                  href="/symptomes"
                  icon={<AlertCircle size={20} />}
                  label="Symptômes"
                  isActive={pathname === "/symptomes"}
                />
                <NavItem
                  href="/profile"
                  icon={<User size={20} />}
                  label="Profile"
                  isActive={pathname === "/profile"}
                />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "w-full my-1",
                    pathname === "/" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  )}
                >
                  <Link href="/"><Home size={20} /></Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "w-full my-1",
                    pathname === "/laboratoire" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  )}
                >
                  <Link href="/laboratoire"><Flask size={20} /></Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "w-full my-1",
                    pathname === "/prescriptions" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  )}
                >
                  <Link href="/prescriptions"><Pill size={20} /></Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "w-full my-1",
                    pathname === "/symptomes" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  )}
                >
                  <Link href="/symptomes"><AlertCircle size={20} /></Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "w-full my-1",
                    pathname === "/profile" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  )}
                >
                  <Link href="/profile"><User size={20} /></Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <span className="text-xs text-muted-foreground">Medical Dashboard</span>
        </div>
      </div>
    </aside>
  );
}
