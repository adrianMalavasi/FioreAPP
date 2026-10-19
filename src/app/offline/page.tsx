"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Você está sem conexão
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Verifique sua conexão com a internet para carregar seus aplicativos no
          App Center.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar novamente</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

