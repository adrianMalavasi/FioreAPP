"use client";

import * as React from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaRegisterAndInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  React.useEffect(() => {
    // Registrar Service Worker do App Center
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("Falha ao registrar Service Worker:", err));
    }

    // Verificar se já está rodando em modo standalone (instalado)
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true)
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowHelpModal(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        className="hidden sm:inline-flex gap-1.5 text-xs"
        title="Instalar App Center no dispositivo"
      >
        <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>Instalar App</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstallClick}
        className="sm:hidden"
        title="Instalar App Center"
        aria-label="Instalar App Center"
      >
        <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </Button>

      <Modal
        open={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Instalar o App Center"
        description="Adicione o App Center à tela inicial para acesso rápido como um aplicativo nativo."
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span>Android (Chrome / Edge) ou Computador</span>
            </div>
            <p className="text-xs leading-relaxed">
              Toque no menu do navegador (três pontos no canto superior) e selecione{" "}
              <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou{" "}
              <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              <Share className="h-4 w-4 text-blue-600" />
              <span>iPhone / iPad (Safari)</span>
            </div>
            <p className="text-xs leading-relaxed">
              Toque no botão <strong>Compartilhar</strong> na barra inferior do
              Safari e escolha{" "}
              <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowHelpModal(false)}>Entendi</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

