// src/components/new-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FlaskConical, ScrollText, Stethoscope } from "lucide-react";

const navItems = [
  { href: "/", label: "Vue d'Ensemble", icon: <Home size={18} /> },
  { href: "/historique", label: "Historique", icon: <ScrollText size={18} /> },
  { href: "/laboratoire", label: "Laboratoire", icon: <FlaskConical size={18} /> },
];

export function NewSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-[240px] border-r bg-card shrink-0 flex flex-col">
      <div className="p-6">
        <div className="font-semibold text-xl text-primary mb-8 flex items-center gap-2">
          <Stethoscope size={28} className="text-primary" /> MedDash
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary/90"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-6 mt-auto">
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Medical Dashboard
        </span>
      </div>
    </aside>
  );
}
