"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/config/navigation";

type AppSidebarProps = {
  items: NavigationItem[];
};

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b bg-background p-4 md:w-64 md:border-b-0 md:border-r">
      <nav className="grid gap-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
