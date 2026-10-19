"use client";

import * as React from "react";
import {
  Search,
  ExternalLink,
  Smartphone,
  Info,
  AppWindow,
  Share,
} from "lucide-react";
import { getAppIconSrc } from "@/lib/app-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface LauncherAppItem {
  id: string;
  name: string;
  description: string | null;
  iconKey: string;
  url: string;
}

interface AppLauncherGridProps {
  userName: string;
  apps: LauncherAppItem[];
}

export function AppLauncherGrid({ userName, apps }: AppLauncherGridProps) {
  const [search, setSearch] = React.useState("");
  const [selectedAppForHelp, setSelectedAppForHelp] =
    React.useState<LauncherAppItem | null>(null);

  const firstName = userName.trim().split(" ")[0] || "Usuário";

  const filteredApps = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apps;
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(term) ||
        (app.description && app.description.toLowerCase().includes(term))
    );
  }, [apps, search]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Launcher: Logo + Saudação simples + Pesquisa */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/icons/icon-192x192.png"
            alt="Logo App Center"
            className="h-11 w-11 rounded-2xl shadow-sm"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Olá, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Toque em um aplicativo para abrir
            </p>
          </div>
        </div>

        {/* Campo de pesquisa */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar aplicativo..."
            className="pl-10 rounded-2xl bg-white dark:bg-slate-900"
            aria-label="Pesquisar aplicativo"
          />
        </div>
      </div>

      {/* Grade de Aplicativos estilo Launcher */}
      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-4">
            <AppWindow className="h-7 w-7" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Nenhum aplicativo disponível no momento
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Você ainda não possui aplicativos liberados para o seu perfil. Caso
            precise de acesso, solicite ao administrador do sistema.
          </p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Nenhum aplicativo encontrado para &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-7 pt-2">
          {filteredApps.map((app) => {
            const iconSrc = getAppIconSrc(app.iconKey);
            return (
              <div
                key={app.id}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Botão discreto de informações/instalação no canto do item */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAppForHelp(app);
                  }}
                  title={`Opções e instruções de instalação para ${app.name}`}
                  aria-label={`Instruções para ${app.name}`}
                  className="
                    absolute -top-1.5 right-2 sm:right-4 z-10
                    flex h-6 w-6 items-center justify-center rounded-full
                    bg-white/90 text-slate-400 shadow-xs border border-slate-200/80
                    opacity-0 group-hover:opacity-100 focus:opacity-100
                    hover:text-blue-600 hover:border-blue-200
                    dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-blue-400
                    transition-opacity cursor-pointer
                  "
                >
                  <Info className="h-3.5 w-3.5" />
                </button>

                {/* Link principal do Ícone + Nome abaixo */}
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center w-full focus:outline-none group"
                >
                  <div
                    className="
                      relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center
                      rounded-[22px] bg-white p-0.5 shadow-sm ring-1 ring-slate-200/60
                      transition-all duration-200 ease-out
                      group-hover:-translate-y-1 group-hover:shadow-md
                      group-active:scale-95
                      dark:bg-slate-900 dark:ring-slate-800
                    "
                  >
                    <img
                      src={iconSrc}
                      alt={app.name}
                      className="h-full w-full rounded-[20px] object-cover select-none"
                      loading="lazy"
                    />
                  </div>

                  <span className="mt-2.5 px-1 text-xs sm:text-sm font-medium leading-tight text-slate-800 group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400 line-clamp-2">
                    {app.name}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Acesso e Instruções de Instalação para Aplicativos PWA Externos */}
      <Modal
        open={Boolean(selectedAppForHelp)}
        onClose={() => setSelectedAppForHelp(null)}
        title={selectedAppForHelp?.name || "Aplicativo"}
        description={
          selectedAppForHelp?.description ||
          "Acesso rápido e instruções para instalar este aplicativo no seu dispositivo."
        }
      >
        {selectedAppForHelp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <img
                src={getAppIconSrc(selectedAppForHelp.iconKey)}
                alt={selectedAppForHelp.name}
                className="h-14 w-14 rounded-2xl shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {selectedAppForHelp.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedAppForHelp.url}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Como instalar este aplicativo (caso ainda não esteja instalado):
              </p>
              <div className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>1. Abra o endereço:</strong> Toque em{" "}
                    <strong>&ldquo;Abrir aplicativo&rdquo;</strong> abaixo para
                    acessar o sistema no navegador.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Share className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>2. Adicione à tela inicial:</strong> No menu do
                    navegador (Chrome, Edge ou Safari), selecione{" "}
                    <em>&ldquo;Instalar aplicativo&rdquo;</em> ou{" "}
                    <em>&ldquo;Adicionar à Tela de Início&rdquo;</em>.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAppForHelp(null)}
              >
                Fechar
              </Button>
              <a
                href={selectedAppForHelp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedAppForHelp(null)}
              >
                <Button>
                  <span>Abrir aplicativo</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

