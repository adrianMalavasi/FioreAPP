"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Users, AppWindow, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { PwaRegisterAndInstall } from "./pwa-install-banner";

interface AppShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      href: "/",
      label: "Meus Apps",
      icon: LayoutGrid,
      active: pathname === "/",
    },
    ...(user.isAdmin
      ? [
          {
            href: "/admin/users",
            label: "Usuários",
            icon: Users,
            active: pathname.startsWith("/admin/users"),
          },
          {
            href: "/admin/apps",
            label: "Aplicativos",
            icon: AppWindow,
            active: pathname.startsWith("/admin/apps"),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Menu lateral discreto no computador (exibido quando administrador) */}
      {user.isAdmin && (
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 z-30">
          <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/60">
            <img
              src="/icons/icon-192x192.png"
              alt="App Center"
              className="h-8 w-8 rounded-xl shadow-xs"
            />
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
              App Center
            </span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    item.active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="mb-3 px-2">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full justify-start text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair da conta</span>
            </Button>
          </div>
        </aside>
      )}

      {/* Conteúdo Principal */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen",
          user.isAdmin && "md:pl-60"
        )}
      >
        {/* Barra Superior Limpa */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/85">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5",
                user.isAdmin && "md:hidden"
              )}
            >
              <img
                src="/icons/icon-192x192.png"
                alt="App Center"
                className="h-8 w-8 rounded-xl shadow-xs"
              />
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
                App Center
              </span>
            </Link>

            {user.isAdmin && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Central de Aplicativos</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <PwaRegisterAndInstall />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sair"
              aria-label="Sair"
              className={cn(
                "text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400",
                user.isAdmin && "md:hidden"
              )}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Navegação mobile discreta para Administrador */}
        {user.isAdmin && (
          <nav className="flex md:hidden items-center justify-around border-b border-slate-200/70 bg-white px-2 py-1.5 dark:border-slate-800/70 dark:bg-slate-900">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    item.active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Área da Página */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

