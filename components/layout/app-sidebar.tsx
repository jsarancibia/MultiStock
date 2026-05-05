"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Shield,
  Store,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/config/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";

type AppSidebarProps = {
  items: NavigationItem[];
};

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname();
  const iconByModule: Record<NavigationItem["module"], ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    products: Boxes,
    inventory: ClipboardList,
    sales: Receipt,
    suppliers: Truck,
    alerts: AlertTriangle,
    audit: BarChart3,
    reports: BarChart3,
    exports: Store,
    admin: Shield,
  };

  return (
    <aside
      className={cn(
        "w-full shrink-0 border-[#3f2a22]/60 bg-[#2b1b16] text-stone-100 dark:border-white/10 dark:bg-[#15100e]",
        "border-b md:h-full md:min-h-0 md:max-w-[18rem] md:overflow-y-auto md:self-stretch md:border-b-0 md:border-r",
        "lg:max-w-[20rem]"
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 shadow-sm">
          <BrandLogo
            className="h-10 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-[#151924] p-0.5 ring-1 ring-white/10"
            fit="contain"
            priority
            sizes="(max-width: 768px) 72px, 80px"
            tone="dark"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-white">MultiStock</p>
            <p className="text-[10px] uppercase tracking-wider text-stone-400">Panel de control</p>
          </div>
        </div>
        <nav
          className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
          aria-label="Navegación principal"
        >
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = iconByModule[item.module];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  "md:shrink",
                  isActive
                    ? "bg-amber-400 text-stone-950 shadow-sm shadow-black/20"
                    : "text-stone-200/85 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
